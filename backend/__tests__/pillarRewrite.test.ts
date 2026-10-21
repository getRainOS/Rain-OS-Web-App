import { describe, it, expect, vi } from 'vitest';
import { pillarRewrite, focusFrom, faqSchema, scoreView } from '../services/pillarRewrite';

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
const scored = (overall: number, extra: any = {}) => ({
  overallScore: overall,
  pillarScores: { aiReadability: overall, digitalAuthority: overall - 10, conversionReadiness: overall, productDiscoverability: 0, localPresence: 0, ragReadiness: overall },
  subScores: [{ label: 'Citation Signals', score: overall - 20 }, { label: 'Structural Clarity', score: overall + 5 }],
  recommendations: [{ text: 'Add an author bio with credentials.' }],
  ...extra,
});
const rw = (text: string, more: any = {}) => ({ rewritten: text, changes: ['Answer-first summary'], truncated: false, needsYou: [], faq: [], ...more });

describe('pillarRewrite', () => {
  it('scores the rewrite with the real scorer and stops after one pass at the target', async () => {
    const analyze = vi.fn().mockResolvedValueOnce(scored(96));
    const rewrite = vi.fn().mockResolvedValueOnce(rw(words(100), { faq: [{ q: 'How much?', a: '$5.' }] }));
    const r = await pillarRewrite(words(100), 'general', { baseline: scored(60) as any }, { analyze, rewrite } as any);
    expect(rewrite).toHaveBeenCalledTimes(1);
    expect(r.before.overall).toBe(60);
    expect(r.after.overall).toBe(96);
    expect(r.improved).toBe(true);
    expect(r.passes).toBe(1);
    expect(JSON.parse(r.schema!)['@type']).toBe('FAQPage');
    expect(rewrite.mock.calls[0][2]).toContain('Citation Signals scored 40/100');
  });

  it('does a second pass aimed at what is still weak, and keeps the better one', async () => {
    const analyze = vi.fn().mockResolvedValueOnce(scored(80)).mockResolvedValueOnce(scored(91));
    const rewrite = vi.fn().mockResolvedValueOnce(rw(words(100), { needsYou: [{ item: 'Real reviews', why: 'Authority', where: 'Top' }] }))
      .mockResolvedValueOnce(rw(words(102)));
    const r = await pillarRewrite(words(100), 'general', { baseline: scored(60) as any }, { analyze, rewrite } as any);
    expect(rewrite).toHaveBeenCalledTimes(2);
    expect(rewrite.mock.calls[1][2]).toContain('Citation Signals scored 60/100');
    expect(r.after.overall).toBe(91);
    expect(r.needsYou.map(n => n.item)).toEqual(['Real reviews']);
  });

  it('keeps the first pass if the second scores lower or drops content', async () => {
    const analyze = vi.fn().mockResolvedValueOnce(scored(85)).mockResolvedValueOnce(scored(70));
    const rewrite = vi.fn().mockResolvedValueOnce(rw(words(100))).mockResolvedValueOnce(rw(words(100)));
    expect((await pillarRewrite(words(100), 'general', { baseline: scored(60) as any }, { analyze, rewrite } as any)).after.overall).toBe(85);

    const analyze2 = vi.fn().mockResolvedValueOnce(scored(85));
    const rewrite2 = vi.fn().mockResolvedValueOnce(rw(words(100))).mockResolvedValueOnce(rw(words(40)));
    const r2 = await pillarRewrite(words(100), 'general', { baseline: scored(60) as any }, { analyze: analyze2, rewrite: rewrite2 } as any);
    expect(analyze2).toHaveBeenCalledTimes(1);
    expect(r2.after.overall).toBe(85);
  });

  it('scores the original first when there is no saved score', async () => {
    const analyze = vi.fn().mockResolvedValueOnce(scored(55)).mockResolvedValueOnce(scored(97));
    const rewrite = vi.fn().mockResolvedValueOnce(rw(words(100)));
    const r = await pillarRewrite(words(100), 'general', {}, { analyze, rewrite } as any);
    expect(analyze).toHaveBeenCalledTimes(2);
    expect(r.before.overall).toBe(55);
  });

  it('shows only the pillars that count in the lane', () => {
    expect(scoreView(scored(70) as any, 'local_business').pillars.map(p => p.key)).toContain('localPresence');
    expect(scoreView(scored(70) as any, 'general').pillars.map(p => p.key)).not.toContain('localPresence');
    expect(focusFrom(scored(95) as any, 'general')).toContain('Digital Authority pillar is 85/100');
    expect(faqSchema([])).toBeNull();
  });
});
