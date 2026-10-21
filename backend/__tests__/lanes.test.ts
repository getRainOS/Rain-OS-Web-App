import { describe, it, expect } from 'vitest';
import { laneOf } from '../services/lanes';

const req = (v?: string) => ({ headers: v === undefined ? {} : { 'x-rain-lane': v } }) as any;

describe('laneOf', () => {
  it('reads a known lane from X-Rain-Lane', () => expect(laneOf(req('local_business'))).toBe('local_business'));
  it('ignores missing or unknown values', () => {
    expect(laneOf(req())).toBeNull();
    expect(laneOf(req('admin'))).toBeNull();
  });
});
