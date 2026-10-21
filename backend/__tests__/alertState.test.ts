import { describe, it, expect } from 'vitest';
import { stepAlertState } from '../services/alertState';

describe('stepAlertState', () => {
  it('takes the first result as the baseline, without alerting', () => {
    expect(stepAlertState(undefined, true)).toEqual({ state: { cited: true, pending: null }, confirmed: null, needsConfirm: false });
  });
  it('needs two checks in a row before a change counts', () => {
    const one = stepAlertState({ cited: false, pending: null }, true);
    expect(one).toEqual({ state: { cited: false, pending: true }, confirmed: null, needsConfirm: true });
    expect(stepAlertState(one.state, true)).toEqual({ state: { cited: true, pending: null }, confirmed: true, needsConfirm: false });
  });
  it('drops a change the next check does not repeat', () => {
    expect(stepAlertState({ cited: false, pending: true }, false)).toEqual({ state: { cited: false, pending: null }, confirmed: null, needsConfirm: false });
  });
  it('ignores a check where the engine showed no AI answer at all', () => {
    expect(stepAlertState({ cited: true, pending: null }, false, false)).toEqual({ state: { cited: true, pending: null }, confirmed: null, needsConfirm: false });
  });
});
