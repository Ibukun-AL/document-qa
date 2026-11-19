const WINDOW_MS = 3_600_000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

export function resetRateLimit() {
  hits.clear();
}

export function rateLimit(ip: string, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return { ok: false, retryAfterSec: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }
  recent.push(now);
  hits.set(ip, recent);
  return { ok: true, retryAfterSec: 0 };
}
