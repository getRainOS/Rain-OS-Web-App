// groundingUsage.ts — counts Gemini calls that use Google Search grounding,
// per day and per feature. Grounded calls are billed separately after a daily
// free allowance, so the admin usage page shows how close we are to it.
// Counting never blocks or fails the request that triggered it.
export function recordGroundedCall(kind: string): void {
  import('./db')
    .then(({ pool }) => pool.query(
      `INSERT INTO grounded_calls_daily (day, kind, calls) VALUES (CURRENT_DATE, $1, 1)
       ON CONFLICT (day, kind) DO UPDATE SET calls = grounded_calls_daily.calls + 1`,
      [kind]
    ))
    .catch(err => console.error('Counting a grounded call failed:', err?.message || err));
}
