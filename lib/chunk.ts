import type { Page } from "./pdf";

export type Chunk = { page: number; text: string };

export function chunkPages(pages: Page[], maxChars = 1200): Chunk[] {
  const out: Chunk[] = [];
  for (const { page, text } of pages) {
    let cur = "";
    for (const word of text.split(/\s+/)) {
      if (cur && cur.length + 1 + word.length > maxChars) {
        out.push({ page, text: cur });
        cur = word;
      } else {
        cur = cur ? `${cur} ${word}` : word;
      }
    }
    if (cur) out.push({ page, text: cur.slice(0, maxChars) });
  }
  return out;
}
