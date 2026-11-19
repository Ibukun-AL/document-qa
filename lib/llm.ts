// Provider-neutral chat call. Works with any OpenAI-compatible endpoint (Gemini, Groq, OpenRouter, ...).
export type LlmConfig = { apiKey: string; baseUrl: string; model: string; maxTokens?: number };

export function llmConfig(): LlmConfig {
  return {
    apiKey: process.env.LLM_API_KEY ?? "",
    baseUrl: process.env.LLM_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai",
    model: process.env.LLM_MODEL ?? "gemini-flash-latest",
    maxTokens: 600,
  };
}

export async function complete(prompt: string, cfg: LlmConfig = llmConfig(), fetchImpl: typeof fetch = fetch): Promise<string> {
  if (!cfg.apiKey) throw new Error("LLM_API_KEY is not set");
  const res = await fetchImpl(`${cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: cfg.maxTokens ?? 600,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`LLM request failed with status ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("LLM returned an empty reply");
  return text;
}
