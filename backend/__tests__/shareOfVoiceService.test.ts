import { describe, it, expect } from 'vitest';
import {
  countMentioned,
  computeDomainShare,
  rankCompetitorDomains,
  buildSummary,
} from '../services/shareOfVoiceService';

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
