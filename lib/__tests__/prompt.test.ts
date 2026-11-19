import { describe, expect, it } from "vitest";
import { buildPrompt, UNANSWERABLE } from "../prompt";

const chunks = [
  { page: 2, text: "Refund within 30 days." },
  { page: 5, text: "Shipping takes 5 days." },
];

describe("buildPrompt", () => {
  it("contains only the given excerpts with page labels", () => {
    const p = buildPrompt("Refund?", chunks);
    expect(p).toContain("[Page 2] Refund within 30 days.");
    expect(p).toContain("[Page 5] Shipping takes 5 days.");
    expect(p).toContain("Refund?");
  });
  it("tells the model the exact unanswerable reply", () => {
    expect(UNANSWERABLE).toBe("The document doesn't say.");
    expect(buildPrompt("x", chunks)).toContain(UNANSWERABLE);
  });
});
