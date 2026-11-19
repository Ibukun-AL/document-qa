import type { Chunk } from "./chunk";

const STOP = new Set(["the", "a", "an", "is", "of", "to", "what", "and", "in", "on", "for", "are", "how", "do", "does"]);
const tokens = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => !STOP.has(t)) ?? [];

export function retrieve(chunks: Chunk[], query: string, k = 4): Chunk[] {
  const q = tokens(query);
  const docs = chunks.map((c) => tokens(c.text));
  const avg = docs.reduce((n, d) => n + d.length, 0) / Math.max(docs.length, 1) || 1;
  const df = (t: string) => docs.filter((d) => d.includes(t)).length;
  const score = (d: string[]) =>
    q.reduce((s, t) => {
      const tf = d.filter((x) => x === t).length;
      if (!tf) return s;
      const idf = Math.log(1 + (docs.length - df(t) + 0.5) / (df(t) + 0.5));
      return s + (idf * tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.length / avg)));
    }, 0);
  return chunks
    .map((c, i) => ({ c, s: score(docs[i]) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.c);
}
