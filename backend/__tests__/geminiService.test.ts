import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { AnalysisResponse } from '../types';

// ─── Set GEMINI_API_KEY before any module is loaded ──────────────────────────
process.env.GEMINI_API_KEY = 'test-key';

// ─── Mock @google/generative-ai SDK ──────────────────────────────────────────
// vi.mock is hoisted above imports so the mock is in place before any import.
let mockResponseText = '';

const generateContent = vi.fn(async () => ({
  response: { text: () => mockResponseText },
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

// ─── Static imports that carry no env-var dependency ─────────────────────────
import { computeReadabilityMetrics, formatMetricsAsGroundingBlock } from '../services/readability';

// ─── Dynamic imports for geminiService (after env var + mocks are set) ────────
let analyzeContent: (content: string, industry?: string) => Promise<AnalysisResponse>;
let API_VERSION: string;

beforeAll(async () => {
  const mod = await import('../services/geminiService');
  analyzeContent = mod.analyzeContent;
  API_VERSION = mod.API_VERSION;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeValidGeminiResponse(overrides: Record<string, unknown> = {}): string {
  const base = {
    overallScore: 63,
    pillarScores: {
      aiReadability: 70,
      digitalAuthority: 60,
      conversionReadiness: 55,
      productDiscoverability: 50,
    },
    ai_readability_detail: {
      structuralClarity: 71,
      answerFirstFormatting: 68,
      semanticPrecision: 72,
      contextSufficiency: 65,
      sectionConceptIsolation: 75,
    },
    digital_authority_detail: {
      citationSignals: 61,
      entityClarity: 58,
      topicalAuthority: 62,
      freshnessSignals: 55,
      socialProofMarkup: 46,
    },
    conversion_readiness_detail: {
      callToActionClarity: 55,
      trustSignals: 52,
      valueProposition: 58,
      frictionReduction: 54,
    },
    product_discoverability_detail: {
      productVariantCoverage: 51,
      merchantIdentityClarity: 48,
      pricingTransparency: 52,
      availabilitySignals: 51,
      comparativeContext: 49,
    },
    phase2_sub_scores: {
      sectionConceptIsolation: 72,
      instructionDeterminism: 65,
      retrievalAnswerability: 68,
      semanticRedundancyScore: 30,
      socialProofMarkup: 46,
      contentChunkingQuality: 71,
      informationGainScore: 62,
      citationReadiness: 66,
      entityLinkability: 58,
      topicalDepthScore: 71,
      queryAlignmentScore: 63,
      multimodalReadiness: 55,
      productVariantCoverage: 51,
      merchantIdentityClarity: 48,
    },
    subScores: [],
    recommendations: ['Add more headers', 'Reduce passive voice'],
    keywords: ['AEO', 'content'],
    authorship: {
      hasAuthorByline: true,
      hasPublishDate: false,
      hasOrganization: true,
      authorityScore: 61,
    },
  };
  return JSON.stringify({ ...base, ...overrides });
}

// ─────────────────────────────────────────────────────────────────────────────
// computeReadabilityMetrics
// ─────────────────────────────────────────────────────────────────────────────
describe('computeReadabilityMetrics', () => {
  it('returns all-zero / safe defaults for empty input', () => {
    const m = computeReadabilityMetrics('');
    expect(m.wordCount).toBe(0);
    expect(m.avgSentenceLength).toBe(0);
    expect(m.sentenceLengthVariance).toBe(0);
    expect(m.longSentenceRatio).toBe(0);
    expect(m.passiveVoiceRatio).toBe(0);
    expect(m.coreferenceLeakCount).toBe(0);
    expect(m.abstractionRatio).toBe(0);
    expect(m.nestedClauseDepth).toBe(0);
    expect(m.headingDensity).toBe(0);
    expect(m.answerFirstRatio).toBe(0);
    expect(m.qaDensity).toBe(0);
    expect(m.definitionDensity).toBe(0);
    expect(m.entityDensity).toBe(0);
    expect(m.listItemRatio).toBe(0);
  });

  it('strips HTML tags before counting words', () => {
    const html = '<h1>Hello World</h1><p>This is a test.</p>';
    const plain = 'Hello World This is a test.';
    const mHtml = computeReadabilityMetrics(html);
    const mPlain = computeReadabilityMetrics(plain);
    expect(mHtml.wordCount).toBe(mPlain.wordCount);
  });

  it('counts HTML headings for headingDensity', () => {
    const text =
      '<h1>Title</h1> ' +
      Array(99).fill('word').join(' ') +
      '.';
    const m = computeReadabilityMetrics(text);
    expect(m.headingDensity).toBeGreaterThan(0);
  });

  it('detects passive voice patterns and computes passiveVoiceRatio', () => {
    const passive =
      'The report was written by analysts. The data was reviewed carefully. ' +
      'Findings were published last week. The model was trained overnight.';
    const m = computeReadabilityMetrics(passive);
    expect(m.passiveVoiceRatio).toBeGreaterThan(0);
  });

  it('has zero passiveVoiceRatio for active-only content', () => {
    const active =
      'Analysts write reports every quarter. Teams review data daily. ' +
      'Researchers publish findings quickly. Engineers train models overnight.';
    const m = computeReadabilityMetrics(active);
    expect(m.passiveVoiceRatio).toBe(0);
  });

  it('counts question sentences for qaDensity', () => {
    const content =
      'What is AEO? It stands for Answer Engine Optimization. ' +
      'How does it work? The engine scores content across four pillars.';
    const m = computeReadabilityMetrics(content);
    expect(m.qaDensity).toBeGreaterThan(0);
  });

  it('detects abstract words and reflects them in abstractionRatio', () => {
    const vague = Array(20).fill('thing stuff various several many').join(' ') + '.';
    const m = computeReadabilityMetrics(vague);
    expect(m.abstractionRatio).toBeGreaterThan(0);
  });

  it('counts HTML list items for listItemRatio', () => {
    const text =
      '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul> ' +
      Array(50).fill('word').join(' ') + '.';
    const m = computeReadabilityMetrics(text);
    expect(m.listItemRatio).toBeGreaterThan(0);
  });

  it('detects coreference leak pronouns', () => {
    const content =
      'The system runs automatically. It checks every request. ' +
      'They process the result and return it. This is useful.';
    const m = computeReadabilityMetrics(content);
    expect(m.coreferenceLeakCount).toBeGreaterThan(0);
  });

  it('measures longSentenceRatio — sentences >30 words', () => {
    const longSent =
      'This is a very long sentence that contains far more than thirty words ' +
      'because it keeps going on and on without stopping at all for any reason whatsoever in this test.';
    const short = 'Short sentence here.';
    const m = computeReadabilityMetrics(`${longSent} ${short}`);
    expect(m.longSentenceRatio).toBeGreaterThan(0);
    expect(m.longSentenceRatio).toBeLessThanOrEqual(1);
  });

  it('detects definition patterns for definitionDensity', () => {
    const content =
      'AEO is defined as Answer Engine Optimization. ' +
      'GEO refers to Generative Engine Optimization. ' +
      Array(20).fill('word').join(' ') + '.';
    const m = computeReadabilityMetrics(content);
    expect(m.definitionDensity).toBeGreaterThan(0);
  });

  it('returns numeric types for all fields', () => {
    const m = computeReadabilityMetrics('Hello world. This is a sentence.');
    const numericKeys: (keyof typeof m)[] = [
      'avgSentenceLength', 'sentenceLengthVariance', 'longSentenceRatio',
      'passiveVoiceRatio', 'coreferenceLeakCount', 'abstractionRatio',
      'nestedClauseDepth', 'headingDensity', 'answerFirstRatio', 'qaDensity',
      'definitionDensity', 'entityDensity', 'listItemRatio', 'wordCount',
    ];
    for (const key of numericKeys) {
      expect(typeof m[key]).toBe('number');
      expect(Number.isFinite(m[key])).toBe(true);
    }
  });

  it('all ratio fields are in [0, 1] range', () => {
    const content = Array(50).fill('This is a sentence. Was it reviewed? They thought so.').join(' ');
    const m = computeReadabilityMetrics(content);
    const ratios: (keyof typeof m)[] = [
      'longSentenceRatio', 'passiveVoiceRatio', 'abstractionRatio',
      'answerFirstRatio', 'qaDensity',
    ];
    for (const key of ratios) {
      expect(m[key]).toBeGreaterThanOrEqual(0);
      expect(m[key]).toBeLessThanOrEqual(1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatMetricsAsGroundingBlock
// ─────────────────────────────────────────────────────────────────────────────
describe('formatMetricsAsGroundingBlock', () => {
  const sampleMetrics = {
    wordCount: 200,
    avgSentenceLength: 18.5,
    sentenceLengthVariance: 6.2,
    longSentenceRatio: 0.12,
    passiveVoiceRatio: 0.08,
    coreferenceLeakCount: 4,
    abstractionRatio: 0.03,
    nestedClauseDepth: 1.8,
    headingDensity: 1.25,
    answerFirstRatio: 0.42,
    qaDensity: 0.06,
    definitionDensity: 0.50,
    entityDensity: 2.10,
    listItemRatio: 0.75,
  };

  it('returns a string containing the pre-analysis header and footer', () => {
    const block = formatMetricsAsGroundingBlock(sampleMetrics);
    expect(block).toContain('ALGORITHMIC PRE-ANALYSIS');
    expect(block).toContain('END PRE-ANALYSIS');
  });

  it('includes all metric values in the output', () => {
    const block = formatMetricsAsGroundingBlock(sampleMetrics);
    expect(block).toContain('200');
    expect(block).toContain('18.5');
    expect(block).toContain('6.2');
    expect(block).toContain('4');
  });

  it('formats ratios as percentages', () => {
    const block = formatMetricsAsGroundingBlock(sampleMetrics);
    expect(block).toContain('12.0%');
    expect(block).toContain('8.0%');
    expect(block).toContain('42.0%');
  });

  it('returns a non-empty multi-line string', () => {
    const block = formatMetricsAsGroundingBlock(sampleMetrics);
    const lines = block.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBeGreaterThan(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// analyzeContent — Gemini SDK mocked
// ─────────────────────────────────────────────────────────────────────────────
describe('analyzeContent', () => {
  beforeEach(() => {
    generateContent.mockClear();
    mockResponseText = makeValidGeminiResponse();
  });

  // ── Missing API key ────────────────────────────────────────────────────────
  it('throws when GEMINI_API_KEY is absent', async () => {
    const savedKey = process.env.GEMINI_API_KEY;
    const savedAlt = process.env.API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;

    // Import a fresh copy of the module so API_KEY captures the empty env
    const { analyzeContent: acFresh } = await import('../services/geminiService?missing_key=1' as string);
    await expect(acFresh('Content here.')).rejects.toThrow('GEMINI_API_KEY environment variable is not set');

    process.env.GEMINI_API_KEY = savedKey ?? 'test-key';
    if (savedAlt !== undefined) process.env.API_KEY = savedAlt;
  });

  // ── Happy path ─────────────────────────────────────────────────────────────
  it('calls generateContent once and returns a valid AnalysisResponse', async () => {
    const result = await analyzeContent('Hello world. This is some content.', 'Tech');
    expect(generateContent).toHaveBeenCalledOnce();
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('returns the API_VERSION constant', async () => {
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.api_version).toBe(API_VERSION);
  });

  it('includes subScores array with required categories', async () => {
    const result = await analyzeContent('Content here.', 'General / Other');
    const categories = result.subScores.map((s) => s.category);
    expect(categories).toContain('structuralClarity');
    expect(categories).toContain('citationSignals');
    expect(categories).toContain('callToActionClarity');
    expect(categories).toContain('productDiscoverability');
  });

  it('clamps all subScore values to [0, 100]', async () => {
    mockResponseText = makeValidGeminiResponse({
      ai_readability_detail: {
        structuralClarity: 150,
        answerFirstFormatting: -10,
        semanticPrecision: 72,
        contextSufficiency: 65,
        sectionConceptIsolation: 75,
      },
    });
    const result = await analyzeContent('Content here.', 'General / Other');
    for (const sub of result.subScores) {
      expect(sub.score).toBeGreaterThanOrEqual(0);
      expect(sub.score).toBeLessThanOrEqual(100);
    }
  });

  it('includes authorship fields with correct types', async () => {
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(typeof result.authorship.hasAuthorByline).toBe('boolean');
    expect(typeof result.authorship.hasPublishDate).toBe('boolean');
    expect(typeof result.authorship.hasOrganization).toBe('boolean');
    expect(typeof result.authorship.authorityScore).toBe('number');
    expect(result.authorship.hash).toBeTruthy();
    expect(result.authorship.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.authorship.status).toBe('Analyzed');
  });

  it('includes recommendations and keywords as arrays', async () => {
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.keywords)).toBe(true);
  });

  it('defaults recommendations and keywords to [] when absent from response', async () => {
    mockResponseText = makeValidGeminiResponse({ recommendations: null, keywords: undefined });
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.recommendations).toEqual([]);
    expect(result.keywords).toEqual([]);
  });

  // ── Semantic redundancy inversion ──────────────────────────────────────────
  function makeResponseWithRedundancy(score: number): string {
    return makeValidGeminiResponse({
      phase2_sub_scores: {
        sectionConceptIsolation: 72,
        instructionDeterminism: 65,
        retrievalAnswerability: 68,
        semanticRedundancyScore: score,
        socialProofMarkup: 46,
        contentChunkingQuality: 71,
        informationGainScore: 62,
        citationReadiness: 66,
        entityLinkability: 58,
        topicalDepthScore: 71,
        queryAlignmentScore: 63,
        multimodalReadiness: 55,
        productVariantCoverage: 51,
        merchantIdentityClarity: 48,
      },
    });
  }

  it('inverts semanticRedundancyScore: raw 30 → exposed 70', async () => {
    mockResponseText = makeResponseWithRedundancy(30);
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.phase2_sub_scores.semanticRedundancyScore).toBe(70);
  });

  it('inverts semanticRedundancyScore: raw 0 → exposed 100 (perfectly clean)', async () => {
    mockResponseText = makeResponseWithRedundancy(0);
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.phase2_sub_scores.semanticRedundancyScore).toBe(100);
  });

  it('inverts semanticRedundancyScore: raw 100 → exposed 0 (maximally repetitive)', async () => {
    mockResponseText = makeResponseWithRedundancy(100);
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.phase2_sub_scores.semanticRedundancyScore).toBe(0);
  });

  it('clamps out-of-range raw redundancy before inverting: 120 → clamped 100 → exposed 0', async () => {
    mockResponseText = makeResponseWithRedundancy(120);
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.phase2_sub_scores.semanticRedundancyScore).toBe(0);
  });

  // ── Overall score correction ───────────────────────────────────────────────
  it('corrects overallScore when Gemini value is >10 off from computed weighted average', async () => {
    // pillar weights: aiReadability*0.30 + digitalAuthority*0.25 + conversionReadiness*0.25 + productDiscoverability*0.20
    // 70*0.30 + 60*0.25 + 55*0.25 + 50*0.20 = 21 + 15 + 13.75 + 10 = 59.75 → round → 60
    // Gemini claims 90 (30 off) → corrected to 60
    mockResponseText = makeValidGeminiResponse({ overallScore: 90 });
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.overallScore).toBe(60);
  });

  it('keeps Gemini overallScore when within 10 points of computed weighted average', async () => {
    // computed = 60; Gemini says 65 (5 off) → stays 65
    mockResponseText = makeValidGeminiResponse({ overallScore: 65 });
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.overallScore).toBe(65);
  });

  it('clamps the final overallScore to [0, 100]', async () => {
    mockResponseText = makeValidGeminiResponse({
      overallScore: 63,
      pillarScores: {
        aiReadability: 0,
        digitalAuthority: 0,
        conversionReadiness: 0,
        productDiscoverability: 0,
      },
    });
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  // ── Malformed JSON response ────────────────────────────────────────────────
  it('throws when Gemini returns non-JSON text', async () => {
    mockResponseText = 'Sorry, I cannot score this content right now.';
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(analyzeContent('Content here.', 'General / Other')).rejects.toThrow(
      'Failed to parse Gemini scoring response as JSON',
    );
    errSpy.mockRestore();
  });

  it('throws when Gemini returns malformed JSON with stray braces', async () => {
    mockResponseText = '{{{ not valid json :::';
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(analyzeContent('Content here.', 'General / Other')).rejects.toThrow(
      'Failed to parse Gemini scoring response as JSON',
    );
    errSpy.mockRestore();
  });

  it('strips markdown fences before parsing JSON', async () => {
    mockResponseText = '```json\n' + makeValidGeminiResponse() + '\n```';
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  // ── Prompt construction ────────────────────────────────────────────────────
  it('includes the industry in the prompt sent to Gemini', async () => {
    await analyzeContent('Content here.', 'Healthcare');
    const callArg = generateContent.mock.calls[0][0] as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    const promptText = callArg.contents[0].parts[0].text;
    expect(promptText).toContain('Healthcare');
  });

  it('includes the pre-analysis grounding block in the prompt', async () => {
    await analyzeContent('Content here.', 'General / Other');
    const callArg = generateContent.mock.calls[0][0] as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    const promptText = callArg.contents[0].parts[0].text;
    expect(promptText).toContain('ALGORITHMIC PRE-ANALYSIS');
  });

  it('caps content at 12000 characters in the prompt', async () => {
    const longContent = 'a'.repeat(20000);
    await analyzeContent(longContent, 'General / Other');
    const callArg = generateContent.mock.calls[0][0] as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    const promptText = callArg.contents[0].parts[0].text;
    const contentSection = promptText.match(/a{100,}/)?.[0] ?? '';
    expect(contentSection.length).toBeLessThanOrEqual(12000);
  });

  // ── Missing / partial Gemini responses ────────────────────────────────────
  it('returns arrays for subScores and recommendations when pillar details are absent', async () => {
    mockResponseText = JSON.stringify({
      overallScore: 50,
      pillarScores: { aiReadability: 50, digitalAuthority: 50, conversionReadiness: 50, productDiscoverability: 50 },
      recommendations: [],
      keywords: [],
      authorship: { hasAuthorByline: false, hasPublishDate: false, hasOrganization: false, authorityScore: 0 },
    });
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(Array.isArray(result.subScores)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('falls back to empty Phase2SubScores object when phase2_sub_scores is absent', async () => {
    mockResponseText = JSON.stringify({
      overallScore: 50,
      pillarScores: { aiReadability: 50, digitalAuthority: 50, conversionReadiness: 50, productDiscoverability: 50 },
      recommendations: [],
      keywords: [],
      authorship: { hasAuthorByline: false, hasPublishDate: false, hasOrganization: false, authorityScore: 0 },
    });
    const result = await analyzeContent('Content here.', 'General / Other');
    expect(result.phase2_sub_scores).toBeDefined();
    expect(typeof result.phase2_sub_scores).toBe('object');
  });
});
