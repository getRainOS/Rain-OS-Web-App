import { describe, it, expect } from 'vitest';
import { computeReadabilityMetrics } from '../services/readability';
import {
  contentTypeId, measuredChecks, measuredFixes, fixStatus, applyTypeScorecard, typeScorecardPrompt,
} from '../services/contentTypes';

const longSocial = 'Going vegan changed how I cook every single day of the week. '.repeat(40);
const shortSocial = 'Going vegan cut our grocery bill by 20%. Here is the one swap that did it: beans instead of beef.';

describe('content type scorecards', () => {
  it('maps labels to ids', () => {
    expect(contentTypeId('Social Post')).toBe('social_post');
    expect(contentTypeId('Landing Page')).toBe('landing_page');
    expect(contentTypeId('Blog Post')).toBe('blog_post');
    expect(contentTypeId(undefined)).toBeNull();
  });

  it('flags a long social post by length, and never asks it for headings or an FAQ', () => {
    const m = computeReadabilityMetrics(longSocial);
    const keys = measuredChecks(m, longSocial, 'social_post').map(c => c.key);
    expect(keys).toContain('characters');
    expect(keys).not.toContain('headingDensity');
    expect(keys).not.toContain('qaDensity');
    expect(measuredFixes(m, longSocial, 'social_post').map(f => f.id)).toContain('m:characters');
  });

  it('asks a long article for headings', () => {
    const text = 'This sentence explains the topic in a plain and direct way for readers. '.repeat(40);
    const fixes = measuredFixes(computeReadabilityMetrics(text), text, 'article');
    expect(fixes.map(f => f.metric)).toContain('headingDensity');
  });

  it('a measured fix is done once the edited text meets the target', () => {
    const before = measuredFixes(computeReadabilityMetrics(longSocial), longSocial, 'social_post');
    const status = fixStatus(before, computeReadabilityMetrics(shortSocial), shortSocial, 'social_post');
    expect(status.find(s => s.id === 'm:characters')?.done).toBe(true);
  });

  it('a judged fix is unknown until scored, then done when its sub-score clears 70', () => {
    const fix = [{ id: 'j:callToActionClarity', source: 'judged' as const, sub: 'callToActionClarity' }];
    const m = computeReadabilityMetrics(shortSocial);
    expect(fixStatus(fix, m, shortSocial, 'social_post')[0].done).toBeNull();
    const scored = { conversion_readiness_detail: { callToActionClarity: 82 }, recommendations: [] };
    expect(fixStatus(fix, m, shortSocial, 'social_post', scored)[0].done).toBe(true);
    const still = { conversion_readiness_detail: { callToActionClarity: 40 }, recommendations: [{ sub: 'callToActionClarity' }] };
    expect(fixStatus(fix, m, shortSocial, 'social_post', still)[0].done).toBe(false);
  });

  it("drops sub-scores that don't apply and adds the type's own under their pillar", () => {
    const parsed: any = {
      rag_readiness_detail: { hierarchicalFormatting: 10, explicitQaStructures: 5, informationDensity: 70 },
      ai_readability_detail: { structuralClarity: 60 },
      content_type_detail: { hookStrength: 81, standaloneTakeaway: 66 },
    };
    applyTypeScorecard(parsed, 'social_post');
    expect(parsed.rag_readiness_detail).toEqual({ informationDensity: 70, standaloneTakeaway: 66 });
    expect(parsed.ai_readability_detail.hookStrength).toBe(81);
    expect(parsed.content_type_detail).toBeUndefined();
  });

  it('blog posts keep the standard scorecard', () => {
    expect(typeScorecardPrompt('blog_post')).toBe('');
    expect(typeScorecardPrompt('social_post')).toContain('hookStrength');
  });
});
