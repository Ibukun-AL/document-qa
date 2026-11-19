"use client";
import { useRef, useState } from "react";
import { SAMPLE_PAGES, SAMPLE_TITLE } from "@/lib/sample";

type Citation = { page: number; quote: string };
type Result = { answer: string; citations: Citation[] };

export default function Chat() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    const body = new FormData();
    body.set("question", question);
    if (file) body.set("file", file);
    try {
      const res = await fetch("/api/ask", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong.");
      else setResult(data);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.25rem", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Ask your document</h1>
      <p style={{ color: "#555" }}>Personal project by Ibukun Aluko. Upload a PDF (up to 5 MB, 40 pages) or ask about the sample below. Answers come only from the document and cite the page.</p>

      <section style={{ margin: "1.5rem 0", padding: "1rem", border: "1px solid #ddd" }}>
        <strong>{file ? file.name : SAMPLE_TITLE}</strong>
        {!file && <ol style={{ margin: "0.75rem 0 0 1.25rem", color: "#555" }}>{SAMPLE_PAGES.map((p) => <li key={p.page}>Page {p.page}: {p.text.slice(0, 70)}…</li>)}</ol>}
        <div style={{ marginTop: "0.75rem" }}>
          <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => fileRef.current?.click()}>Upload a PDF</button>
          {file && <button type="button" style={{ marginLeft: 8 }} onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>Use sample instead</button>}
        </div>
      </section>

      <form onSubmit={ask}>
        <label htmlFor="q" style={{ display: "block", fontWeight: 600 }}>Your question</label>
        <input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} required placeholder={file ? "Ask about your document" : "How long do I have to return an item?"} style={{ width: "100%", padding: "0.7rem", margin: "0.5rem 0" }} />
        <button disabled={busy || !question.trim()}>{busy ? "Reading…" : "Ask"}</button>
      </form>

      <div aria-live="polite">
        {error && <p role="alert" style={{ color: "#a00" }}>{error}</p>}
        {result && (
          <section style={{ marginTop: "1.5rem" }}>
            <p style={{ fontSize: "1.15rem" }}>{result.answer}</p>
            {result.citations.length > 0 && <ul>{result.citations.map((c, i) => <li key={i}><strong>Page {c.page}:</strong> “{c.quote}”</li>)}</ul>}
          </section>
        )}
      </div>
    </main>
  );
}
