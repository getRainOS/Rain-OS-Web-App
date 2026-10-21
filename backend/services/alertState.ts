// services/alertState.ts — when a tracked question's status on an engine has
// really changed. One check is a noisy sample, so a change is only believed
// when the next check agrees; the first result is the baseline and never
// alerts. Used for every engine except Gemini, whose state lives in its own
// tracked_queries columns (same rule).
export interface EngineAlertState { cited: boolean; pending: boolean | null }

export interface AlertStep {
  state: EngineAlertState;
  confirmed: boolean | null; // the new status when a change is confirmed, else null
  needsConfirm: boolean;     // a change was seen once; check again soon
}

// shown=false: the engine gave no AI answer at all (e.g. Google showed no AI
// Overview). That says nothing about being cited, so it changes nothing.
export function stepAlertState(prev: EngineAlertState | undefined, cited: boolean, shown = true): AlertStep {
  if (!shown) return { state: prev ?? { cited: false, pending: null }, confirmed: null, needsConfirm: false };
  if (!prev || prev.cited === cited) return { state: { cited, pending: null }, confirmed: null, needsConfirm: false };
  if (prev.pending === cited) return { state: { cited, pending: null }, confirmed: cited, needsConfirm: false };
  return { state: { cited: prev.cited, pending: cited }, confirmed: null, needsConfirm: true };
}
