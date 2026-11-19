import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimit } from "../ratelimit";

describe("rateLimit", () => {
  it("blocks the sixth request in an hour", () => {
    resetRateLimit();
    for (let i = 0; i < 5; i++) expect(rateLimit("1.1.1.1", 1000).ok).toBe(true);
    const r = rateLimit("1.1.1.1", 1000);
    expect(r.ok).toBe(false);
    expect(r.retryAfterSec).toBeGreaterThan(0);
  });
  it("resets after an hour", () => {
    resetRateLimit();
    for (let i = 0; i < 5; i++) rateLimit("2.2.2.2", 0);
    expect(rateLimit("2.2.2.2", 3_600_001).ok).toBe(true);
  });
  it("tracks IPs separately", () => {
    resetRateLimit();
    for (let i = 0; i < 5; i++) rateLimit("3.3.3.3", 0);
    expect(rateLimit("4.4.4.4", 0).ok).toBe(true);
  });
});
