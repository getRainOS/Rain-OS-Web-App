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

  it('flags a long social post by length, never asks it for an FAQ, and wants no headings', () => {
    const m = computeReadabilityMetrics(longSocial);
    const keys = measuredChecks(m, longSocial, 'social_post').map(c => c.key);
    expect(keys).toContain('characters');
    expect(keys).not.toContain('qaDensity');
    // Headings are checked only to be absent: plain text passes.
    expect(measuredChecks(m, longSocial, 'social_post').find(c => c.key === 'headingDensity')?.pass).toBe(true);
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

import { coverageFixes } from '../services/contentTypes';
describe('fix coverage', () => {
  const parsed = {
    pillarScores: { aiReadability: 49, digitalAuthority: 68, conversionReadiness: 42, ragReadiness: 59, localPresence: 30 },
    ai_readability_detail: { structuralClarity: 45, semanticPrecision: 80 },
    digital_authority_detail: { citationSignals: 52, entityClarity: 85 },
    conversion_readiness_detail: { callToActionClarity: 25 },
    rag_readiness_detail: { informationDensity: 72, explicitQaStructures: 74 },
    local_presence_detail: { napConsistency: 10 },
  };
  const counted = ['ai_readability', 'digital_authority', 'conversion_readiness', 'rag_readiness'] as const;

  it('adds a fix for every weak sub-score the scorer skipped', () => {
    const out = coverageFixes(parsed, [{ sub: 'callToActionClarity', pillar: 'conversion_readiness' }], [...counted]);
    expect(out.map(f => f.sub)).toEqual(expect.arrayContaining(['structuralClarity', 'citationSignals']));
    expect(out.map(f => f.sub)).not.toContain('callToActionClarity');
    expect(out.find(f => f.sub === 'citationSignals')?.text).toMatch(/^Citation Signals is 52\/100\./);
  });

  it('gives a pillar under 75 a fix even when no sub-score is under 70', () => {
    const out = coverageFixes(parsed, [{ sub: 'callToActionClarity', pillar: 'conversion_readiness' }], [...counted]);
    expect(out.find(f => f.pillar === 'rag_readiness')?.sub).toBe('informationDensity');
  });

  it("ignores pillars that don't count in the lane", () => {
    expect(coverageFixes(parsed, [], [...counted]).some(f => f.pillar === 'local_presence')).toBe(false);
  });
});

import { unverifiedDetails } from '../services/contentTypes';
describe('invention check', () => {
  const original = 'Veganism avoids animal products. The term was coined in 1944.';
  it('flags new numbers, studies years and placeholders, not ones already there', () => {
    const rewrite = 'A 2023 study found a 75% cut. The term dates from 1944. Learn more: [Link to a reputable source]';
    expect(unverifiedDetails(original, rewrite)).toEqual(expect.arrayContaining(['2023', '75%', '[Link to a reputable source]']));
    expect(unverifiedDetails(original, rewrite)).not.toContain('1944');
    expect(unverifiedDetails('w1 w2', 'w100 w101 step 2')).toEqual([]);
  });
  it('accepts numbers from the verified facts', () => {
    expect(unverifiedDetails('Our mat is great.', 'The mat costs $89.', 'Price: 89 USD')).toEqual([]);
  });
});
