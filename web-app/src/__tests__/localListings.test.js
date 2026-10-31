import { describe, it, expect } from 'vitest';
import { needsPlace } from '../lib/localListings.js';

describe('needsPlace', () => {
  it('flags "near me" with no city named', () => {
    expect(needsPlace('best plumber near me')).toBe(true);
  });
  it('does not flag a question that names a city', () => {
    expect(needsPlace('best plumber near me in Austin')).toBe(false);
  });
  it('does not flag an ordinary question', () => {
    expect(needsPlace('how do I fix a leaky tap')).toBe(false);
  });
  it('handles empty input', () => {
    expect(needsPlace('')).toBe(false);
  });
});
