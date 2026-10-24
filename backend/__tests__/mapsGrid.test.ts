import { describe, it, expect } from 'vitest';
import { buildGrid, summarize } from '../services/mapsGrid';

describe('maps grid', () => {
  it('builds a square grid centred on the business, about the given spacing apart', () => {
    const g = buildGrid({ lat: 30.2672, lng: -97.7431 }, 5, 1.6);
    expect(g).toHaveLength(25);
    const mid = g.find(p => p.row === 2 && p.col === 2)!;
    expect(mid.lat).toBeCloseTo(30.2672, 4);
    expect(mid.lng).toBeCloseTo(-97.7431, 4);
    const north = g.find(p => p.row === 0 && p.col === 2)!;
    expect((north.lat - mid.lat) * 110.574).toBeCloseTo(3.2, 1); // two steps north
    const west = g.find(p => p.row === 2 && p.col === 0)!;
    expect(west.lng).toBeLessThan(mid.lng);
  });

  it('summarises positions', () => {
    const pts = [1, 2, 5, null, 12].map((position, i) => ({ row: 0, col: i, lat: 0, lng: 0, position }));
    expect(summarize(pts)).toEqual({ top3: 2, top10: 3, found: 4, total: 5, averagePosition: 5 });
  });
});
