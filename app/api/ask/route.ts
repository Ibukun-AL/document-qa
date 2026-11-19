import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { chunkPages } from "@/lib/chunk";
import { extractPages, NoTextError, TooLargeError } from "@/lib/pdf";
import { buildPrompt, UNANSWERABLE } from "@/lib/prompt";
import { rateLimit } from "@/lib/ratelimit";
import { retrieve } from "@/lib/retrieve";
import { SAMPLE_PAGES } from "@/lib/sample";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You've reached the demo limit of 5 questions per hour. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const form = await req.formData();
  const question = String(form.get("question") ?? "").trim();
  if (!question || question.length > 500) {
    return NextResponse.json({ error: "Ask a question of up to 500 characters." }, { status: 400 });
  }

  let pages = SAMPLE_PAGES;
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "That PDF is over 5 MB." }, { status: 413 });
    try {
      pages = await extractPages(Buffer.from(await file.arrayBuffer()));
    } catch (e) {
      if (e instanceof NoTextError) return NextResponse.json({ error: "This PDF has no readable text." }, { status: 422 });
      if (e instanceof TooLargeError) return NextResponse.json({ error: "That PDF is over 40 pages." }, { status: 413 });
      return NextResponse.json({ error: "Couldn't read that file as a PDF." }, { status: 422 });
    }
  }

  const chunks = retrieve(chunkPages(pages), question, 4);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 600,
      messages: [{ role: "user", content: buildPrompt(question, chunks) }],
    });
    const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const answer = String(json.answer ?? UNANSWERABLE);
    const citations = answer === UNANSWERABLE ? [] : Array.isArray(json.citations) ? json.citations : [];
    return NextResponse.json({ answer, citations });
  } catch {
    return NextResponse.json({ error: "The assistant couldn't answer right now. Please try again." }, { status: 502 });
  }
}
