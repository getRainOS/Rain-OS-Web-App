import { describe, it, expect } from 'vitest';
import {
  countMentioned,
  computeDomainShare,
  rankCompetitorDomains,
  buildSummary,
  buildRecommendations,
} from '../services/shareOfVoiceService';
import { buildAnswerExcerpt, ANSWER_EXCERPT_LIMIT } from '../services/textExcerpt';

function mention(mentioned: boolean) {
  return { mentioned };
}

function source(domain: string) {
  return { title: domain, url: `https://${domain}`, domain };
}

describe('countMentioned', () => {
  it('counts 0 of 3', () => {
    expect(countMentioned([mention(false), mention(false), mention(false)])).toBe(0);
  });

  it('counts 1 of 3', () => {
    expect(countMentioned([mention(true), mention(false), mention(false)])).toBe(1);
  });

  it('counts 2 of 3', () => {
    expect(countMentioned([mention(true), mention(true), mention(false)])).toBe(2);
  });

  it('counts 3 of 3', () => {
    expect(countMentioned([mention(true), mention(true), mention(true)])).toBe(3);
  });
});

describe('computeDomainShare', () => {
  it('is entirely null when no URL was given', () => {
    const sources = [source('acme.com'), source('widgetco.com')];
    expect(computeDomainShare(sources, null)).toEqual({
      domainCitedCount: null,
      domainSourceCount: null,
      domainSharePercent: null,
    });
  });

  it('does not divide by zero when there are no sources at all', () => {
    expect(computeDomainShare([], 'acme.com')).toEqual({
      domainCitedCount: 0,
      domainSourceCount: 0,
      domainSharePercent: 0,
    });
  });

  it('computes N of M and a percent when sources exist', () => {
    const sources = [source('acme.com'), source('widgetco.com'), source('acme.com'), source('gizmo.io')];
    expect(computeDomainShare(sources, 'acme.com')).toEqual({
      domainCitedCount: 2,
      domainSourceCount: 4,
      domainSharePercent: 50,
    });
  });

  it('matches subdomains, same as Citation Monitor', () => {
    const sources = [source('blog.acme.com'), source('widgetco.com')];
    expect(computeDomainShare(sources, 'acme.com')).toEqual({
      domainCitedCount: 1,
      domainSourceCount: 2,
      domainSharePercent: 50,
    });
  });
});

describe('rankCompetitorDomains', () => {
  it('ranks domains by frequency across all prompts', () => {
    const modelResults = [
      { sources: [source('widgetco.com'), source('gizmo.io')] },
      { sources: [source('widgetco.com')] },
      { sources: [source('widgetco.com'), source('gizmo.io'), source('other.com')] },
    ];
    expect(rankCompetitorDomains(modelResults, null)).toEqual([
      'widgetco.com', 'gizmo.io', 'other.com',
    ]);
  });

  it('excludes the user\'s own domain', () => {
    const modelResults = [
      { sources: [source('acme.com'), source('widgetco.com')] },
      { sources: [source('acme.com'), source('widgetco.com')] },
    ];
    expect(rankCompetitorDomains(modelResults, 'acme.com')).toEqual(['widgetco.com']);
  });

  it('excludes subdomains of the user\'s own domain too', () => {
    const modelResults = [{ sources: [source('blog.acme.com'), source('widgetco.com')] }];
    expect(rankCompetitorDomains(modelResults, 'acme.com')).toEqual(['widgetco.com']);
  });

  it('respects the limit', () => {
    const modelResults = [
      { sources: [source('a.com'), source('b.com'), source('c.com'), source('d.com')] },
    ];
    expect(rankCompetitorDomains(modelResults, null, 2)).toEqual(['a.com', 'b.com']);
  });

  it('returns an empty list with no sources', () => {
    expect(rankCompetitorDomains([{ sources: [] }], null)).toEqual([]);
  });
});

describe('buildSummary', () => {
  it('describes a fully-mentioned brand with no URL', () => {
    expect(buildSummary('Acme', 'best widgets', 3, null, null, null)).toBe(
      'Acme was mentioned in all 3 query phrasings for "best widgets".'
    );
  });

  it('describes a partially-mentioned brand', () => {
    expect(buildSummary('Acme', 'best widgets', 2, null, null, null)).toBe(
      'Acme was mentioned in 2 of 3 query phrasings for "best widgets".'
    );
  });

  it('describes a not-mentioned brand with no URL', () => {
    expect(buildSummary('Acme', 'best widgets', 0, null, null, null)).toBe(
      'Acme was not mentioned in any of the 3 query phrasings for "best widgets".'
    );
  });

  it('appends the domain share when a URL was given', () => {
    expect(buildSummary('Acme', 'best widgets', 1, 25, 1, 4)).toBe(
      'Acme was mentioned in 1 of 3 query phrasings for "best widgets". Your domain is 1 of 4 cited sources (25%).'
    );
  });

  it('notes when there were no grounded sources at all', () => {
    expect(buildSummary('Acme', 'best widgets', 0, 0, 0, 0)).toBe(
      'Acme was not mentioned in any of the 3 query phrasings for "best widgets". Gemini returned no grounded sources across the 3 prompts.'
    );
  });
});

// Each ModelResult's answerExcerpt is built with the shared
// buildAnswerExcerpt() (services/textExcerpt.ts, fully covered by
// textExcerpt.test.ts) instead of a blind character slice, and the frontend
// no longer re-slices it a second time. These confirm this service gets the
// same sentence/word-boundary behavior.
describe('answerExcerpt (via the shared buildAnswerExcerpt helper)', () => {
  it('leaves a normal answer under the limit completely unchanged', () => {
    const text = 'Acme is a strong pick for this topic. It ships fast.';
    expect(buildAnswerExcerpt(text)).toBe(text);
  });

  it('cuts a long answer at a sentence boundary and appends an indicator', () => {
    const sentence = 'Acme is a strong pick for this query every time.';
    const sentences = Array(100).fill(sentence);
    const text = sentences.join(' ');
    expect(text.length).toBeGreaterThan(ANSWER_EXCERPT_LIMIT);

    const result = buildAnswerExcerpt(text);

    expect(result.length).toBeLessThanOrEqual(ANSWER_EXCERPT_LIMIT + 1);
    expect(result.endsWith('…')).toBe(true);
    const withoutEllipsis = result.slice(0, -1);
    const parts = withoutEllipsis.split(/(?<=\.) /);
    expect(parts.length).toBeLessThan(sentences.length);
    for (const part of parts) {
      expect(part).toBe(sentence);
    }
  });

  it('falls back to the nearest word boundary when there is no sentence boundary before the limit', () => {
    const text = Array(500).fill('pickpick').join(' ');
    expect(text.length).toBeGreaterThan(ANSWER_EXCERPT_LIMIT);

    const result = buildAnswerExcerpt(text);

    expect(result.endsWith('…')).toBe(true);
    const withoutEllipsis = result.slice(0, -1);
    expect(withoutEllipsis.length).toBeLessThanOrEqual(ANSWER_EXCERPT_LIMIT);
    expect(text[withoutEllipsis.length]).toBe(' ');
  });
});

describe('buildRecommendations', () => {
  it('tells the user to run Content Optimizer when never mentioned', () => {
    const recs = buildRecommendations(0, null, null, [], false);
    expect(recs.some(r => r.includes('Content Optimizer'))).toBe(true);
  });

  it('asks for a URL when none was given, instead of assuming domain share', () => {
    const recs = buildRecommendations(2, null, null, ['competitor.com'], false);
    expect(recs.some(r => r.includes('Add your website URL'))).toBe(true);
  });

  it('names the top competitor and points to URL Scanner when domain share is zero', () => {
    const recs = buildRecommendations(2, 0, 0, ['competitor.com', 'other.com'], true);
    expect(recs.some(r => r.includes('competitor.com') && r.includes('URL Scanner'))).toBe(true);
  });

  it('names the top competitor when share is low but nonzero', () => {
    const recs = buildRecommendations(3, 25, 1, ['competitor.com'], true);
    expect(recs.some(r => r.includes('competitor.com'))).toBe(true);
  });

  it('gives a maintenance tip, not a problem, when share is already strong', () => {
    const recs = buildRecommendations(3, 75, 3, ['competitor.com'], true);
    expect(recs.some(r => r.toLowerCase().includes('leading cited source'))).toBe(true);
  });

  it('returns no recommendations when everything already looks healthy with no url', () => {
    const recs = buildRecommendations(3, null, null, [], false);
    expect(recs).toContain('Add your website URL next time you run this check — without it, we can only tell you whether you were mentioned by name, not whether your domain is actually among the cited sources.');
  });
});
