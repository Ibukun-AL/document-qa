"use client";
import { useRef, useState } from "react";
import { SAMPLE_PAGES, SAMPLE_TITLE } from "@/lib/sample";
import s from "@/app/page.module.css";

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

  const EXAMPLES = ["How long do I have to return an item?", "Is shipping free?", "What does the warranty cover?"];
  return (
    <div className={s.shell}>
      <div className={s.top}><div className={s.topIn}><span className={s.dot} aria-hidden="true" />Ask your document<span className={s.tag}>Personal project by Ibukun Aluko</span></div></div>
      <main className={s.main}>
        <div>
          <h1 className={s.h1}>Ask a document. Get the page it came from.</h1>
          <p className={s.lede}>Upload a PDF (up to 5 MB, 40 pages) or try the sample below. Answers come only from the document, and each one cites its page.</p>
        </div>

        <section className={s.doc} aria-label="Document">
          <div className={s.docHead}>
            <strong className={s.docTitle}>{file ? file.name : SAMPLE_TITLE}</strong>
            <span className={s.badge}>{file ? "Your PDF" : "Sample"}</span>
          </div>
          {!file && <div className={s.pages}>{SAMPLE_PAGES.map((p) => <p key={p.page} className={s.pageCard}><span className={s.pageNo}>Page {p.page}</span>{p.text.slice(0, 80)}…</p>)}</div>}
          <div className={s.row}>
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <button type="button" className={s.ghost} onClick={() => fileRef.current?.click()}>Upload a PDF</button>
            {file && <button type="button" className={s.ghost} onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>Use sample instead</button>}
          </div>
        </section>

        <form onSubmit={ask}>
          <label htmlFor="q" className={s.label}>Your question</label>
          <div className={s.ask}>
            <input id="q" className={s.input} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} required placeholder={file ? "Ask about your document" : "How long do I have to return an item?"} />
            <button className={s.go} disabled={busy || !question.trim()}>{busy ? "Reading…" : "Ask"}</button>
          </div>
          {!file && <div className={s.chips}>{EXAMPLES.map((q) => <button type="button" key={q} className={s.chip} onClick={() => setQuestion(q)}>{q}</button>)}</div>}
        </form>

        <div aria-live="polite">
          {error && <p role="alert" className={s.error}>{error}</p>}
          {result && (
            <section className={s.answer}>
              <p className={s.answerText}>{result.answer}</p>
              {result.citations.length > 0 && <ul className={s.cites}>{result.citations.map((c, i) => <li key={i} className={s.cite}><span>Page {c.page}</span><q>{c.quote}</q></li>)}</ul>}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
