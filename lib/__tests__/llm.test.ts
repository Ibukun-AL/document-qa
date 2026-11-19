import { describe, expect, it } from "vitest";
import { complete } from "../llm";

const ok = (content: string) => async () =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

describe("complete", () => {
  it("sends an OpenAI-style chat request with the key, model and prompt", async () => {
    let seen: { url: string; init: RequestInit } | null = null;
    const fake = async (url: string | URL | Request, init?: RequestInit) => {
      seen = { url: String(url), init: init! };
      return ok("hello")();
    };
    const text = await complete("Why?", { apiKey: "k", baseUrl: "https://x.test/v1/", model: "m", maxTokens: 50 }, fake as typeof fetch);
    expect(text).toBe("hello");
    expect(seen!.url).toBe("https://x.test/v1/chat/completions");
    expect((seen!.init.headers as Record<string, string>).Authorization).toBe("Bearer k");
    const body = JSON.parse(String(seen!.init.body));
    expect(body.model).toBe("m");
    expect(body.max_tokens).toBe(50);
    expect(body.messages[0]).toEqual({ role: "user", content: "Why?" });
  });

  it("throws when the provider returns an error status", async () => {
    const fake = async () => new Response("rate limited", { status: 429 });
    await expect(complete("q", { apiKey: "k", baseUrl: "https://x.test", model: "m" }, fake as typeof fetch)).rejects.toThrow(/429/);
  });

  it("throws when the key is missing", async () => {
    await expect(complete("q", { apiKey: "", baseUrl: "https://x.test", model: "m" }, ok("x") as typeof fetch)).rejects.toThrow(/LLM_API_KEY/);
  });

  it("throws when the reply has no text", async () => {
    const fake = async () => new Response(JSON.stringify({ choices: [] }), { status: 200 });
    await expect(complete("q", { apiKey: "k", baseUrl: "https://x.test", model: "m" }, fake as typeof fetch)).rejects.toThrow(/empty/i);
  });
});
