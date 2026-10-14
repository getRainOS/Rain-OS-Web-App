// services/dailyLimiter.ts — per-user rolling 24h cap for Gemini-backed endpoints.
// In memory is enough: it only guards cost, and a restart resetting it early is harmless.
const DAY_MS = 24 * 60 * 60 * 1000;

export function createDailyLimiter(limit: number) {
  const usage = new Map<string, number[]>();
  return function takeSlot(userId: string, now = Date.now()): boolean {
    const recent = (usage.get(userId) || []).filter(t => now - t < DAY_MS);
    if (recent.length >= limit) {
      usage.set(userId, recent);
      return false;
    }
    recent.push(now);
    usage.set(userId, recent);
    return true;
  };
}
