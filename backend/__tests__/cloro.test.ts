import { describe, it, expect } from 'vitest';
import { parseCloroResult, US_STATES } from '../services/engines/cloro';

describe('parseCloroResult', () => {
  it('reads sources in order, removes duplicate URLs and keeps brand names', () => {
    const out = parseCloroResult({
      text: 'Answer',
      sources: [
        { position: 1, label: 'Guide', url: 'https://www.weddingwire.com/a' },
        { position: 2, label: '', url: 'https://theknot.com/b' },
        { position: 3, label: 'Guide again', url: 'https://www.weddingwire.com/a' },
        { position: 4 },
      ],
      entities: [{ type: 'software', name: 'Peec AI' }, { name: '' }],
    });
    expect(out.sources.map(s => s.domain)).toEqual(['weddingwire.com', 'theknot.com']);
    expect(out.sources[1].title).toBe('theknot.com');
    expect(out.entities).toEqual(['Peec AI']);
    expect(out.text).toBe('Answer');
  });
  it('survives an empty or odd reply', () => {
    expect(parseCloroResult(undefined)).toEqual({ text: '', sources: [], entities: [] });
  });
  it('knows the US state codes cloro accepts', () => {
    expect(US_STATES.has('TX')).toBe(true);
    expect(US_STATES.has('DC')).toBe(true);
    expect(US_STATES.has('ZZ')).toBe(false);
  });
});
