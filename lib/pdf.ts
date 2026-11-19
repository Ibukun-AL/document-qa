import { getDocumentProxy, extractText } from "unpdf";

export class NoTextError extends Error {}
export class TooLargeError extends Error {}

export const MAX_PAGES = 40;
export type Page = { page: number; text: string };

export async function extractPages(buf: Buffer): Promise<Page[]> {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  if (pdf.numPages > MAX_PAGES) throw new TooLargeError(`Over ${MAX_PAGES} pages`);
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = text.map((t, i) => ({ page: i + 1, text: t.trim() }));
  if (pages.every((p) => p.text.length === 0)) throw new NoTextError("No readable text");
  return pages.filter((p) => p.text.length > 0);
}
