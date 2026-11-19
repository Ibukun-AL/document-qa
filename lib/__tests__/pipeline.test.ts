import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractPages, NoTextError, TooLargeError } from "../pdf";
import { chunkPages } from "../chunk";
import { retrieve } from "../retrieve";

const fx = (n: string) => readFileSync(join(__dirname, "fixtures", n));

describe("pdf pipeline", () => {
  it("extracts page numbers", async () => {
    const pages = await extractPages(fx("sample.pdf"));
    expect(pages.find((p) => p.text.includes("Refund"))?.page).toBe(2);
  });
  it("throws NoTextError on a scanned pdf", async () => {
    await expect(extractPages(fx("scanned.pdf"))).rejects.toBeInstanceOf(NoTextError);
  });
  it("throws TooLargeError over 40 pages", async () => {
    await expect(extractPages(fx("long.pdf"))).rejects.toBeInstanceOf(TooLargeError);
  });
  it("chunks never exceed max", () => {
    const chunks = chunkPages([{ page: 1, text: "word ".repeat(1000) }], 1200);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.text.length <= 1200 && c.page === 1)).toBe(true);
  });
  it("ranks the matching chunk first", () => {
    const chunks = [
      { page: 1, text: "Quarterly report cover" },
      { page: 2, text: "Refund policy: return items within 30 days" },
    ];
    expect(retrieve(chunks, "what is the refund policy", 2)[0].page).toBe(2);
  });
});
