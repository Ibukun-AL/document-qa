import type { Chunk } from "./chunk";

export const UNANSWERABLE = "The document doesn't say.";

export function buildPrompt(question: string, chunks: Chunk[]): string {
  const excerpts = chunks.map((c) => `[Page ${c.page}] ${c.text}`).join("\n\n");
  return `Answer the question using ONLY the excerpts below. Do not use outside knowledge.
If the excerpts do not contain the answer, set "answer" to exactly: ${UNANSWERABLE} and return no citations.
Respond with JSON only: {"answer": string, "citations": [{"page": number, "quote": string}]}.
Each quote must be copied verbatim from an excerpt.

Excerpts:
${excerpts}

Question: ${question}`;
}
