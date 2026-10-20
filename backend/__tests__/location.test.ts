import { describe, it, expect } from 'vitest';
import { normaliseLocation } from '../services/engines/location';

describe('normaliseLocation', () => {
  it('falls back to the Settings state when the check does not pick one', () => {
    expect(normaliseLocation(undefined, undefined, 'TX')).toEqual({ country: 'US', state: 'TX' });
  });
  it('an explicit "no state" overrides the Settings default', () => {
    expect(normaliseLocation('US', null, 'TX')).toEqual({ country: 'US', state: null });
  });
  it('drops the state outside the US and rejects unknown values', () => {
    expect(normaliseLocation('ca', 'TX')).toEqual({ country: 'CA', state: null });
    expect(normaliseLocation('ZZ', 'XX')).toEqual({ country: 'US', state: null });
  });
});
