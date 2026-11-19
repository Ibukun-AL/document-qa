# Document Q&A

Personal project by Ibukun Aluko. Upload a PDF (up to 5 MB and 40 pages) or ask about the built-in sample, and get an answer that cites the page it came from.

## How it works

1. **Extract.** Text is pulled from the PDF page by page, so every excerpt keeps its page number.
2. **Chunk and retrieve.** Pages are split into chunks and ranked against the question with BM25-style keyword scoring. There is no vector database, on purpose: for documents this size it is simpler and easy to explain.
3. **Answer.** The top excerpts go to an LLM with strict instructions: answer only from the excerpts, copy quotes verbatim, and reply exactly "The document doesn't say." when the answer is not there.
4. **Fail clearly.** Scanned PDFs, oversized files, malformed files and rate limits each return a specific message instead of a blank or broken answer.

## Run it

```bash
cp .env.example .env.local   # add your LLM_API_KEY
npm install
npm run dev
```

The model call uses any OpenAI-compatible endpoint. The defaults point at Google's Gemini API (free tier, key from Google AI Studio). Change `LLM_BASE_URL` and `LLM_MODEL` to use Groq, OpenRouter or another provider.

| Variable | Purpose |
|---|---|
| `LLM_API_KEY` | Provider key. Server-side only, never sent to the browser. |
| `LLM_BASE_URL` | OpenAI-compatible base URL. |
| `LLM_MODEL` | Model name. |

## Limits

The public demo allows 5 questions per hour per visitor and caps uploads at 5 MB and 40 pages. The rate limiter is in memory, so it is best-effort across serverless instances. Do not upload anything sensitive: free LLM tiers may use submitted text to improve their products.

## Tests

```bash
npm test
```

14 Vitest tests cover chunking, retrieval, the prompt, rate limiting and the provider client.
