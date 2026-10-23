// services/pillarRewrite.ts — a rewrite held to the scoring rubric, and proven.
//   1. Start from the piece's current score (saved analysis, or score it now).
//   2. Rewrite against the rubric, aimed at the weakest sub-scores.
//   3. Score the rewrite with the same scorer. Below TARGET, do one more pass
//      aimed at what is still weak, and keep whichever version scores higher.
// Returns the verified before/after, what only the owner can supply, and an
// FAQ with ready-to-paste schema, so the result is more than a chat reply.
import { analyzeContent, rewriteDocumentForAI, wordCount, MIN_REWRITE_RATIO, isShortForm, type NeedsYou } from './geminiService';
import { rewriteSignals, type RewriteSignal } from './rewriteSignals';
import type { AnalysisResponse } from '../types';

export const TARGET = 95;

const PILLARS: Array<[keyof AnalysisResponse['pillarScores'], string]> = [
  ['aiReadability', 'AI Readability'], ['digitalAuthority', 'Digital Authority'], ['conversionReadiness', 'Conversion Readiness'],
  ['productDiscoverability', 'Product Discoverability'], ['localPresence', 'Local Presence'], ['ragReadiness', 'RAG Readiness'],
];
// Pillars that count toward the overall score in each lane.
const COUNTED: Record<string, string[]> = {
  product_sellers: ['aiReadability', 'digitalAuthority', 'conversionReadiness', 'productDiscoverability', 'ragReadiness'],
  local_business: ['aiReadability', 'digitalAuthority', 'conversionReadiness', 'localPresence', 'ragReadiness'],
  general: ['aiReadability', 'digitalAuthority', 'conversionReadiness', 'ragReadiness'],
  developers: ['aiReadability', 'digitalAuthority', 'conversionReadiness', 'ragReadiness'],
  vibe_coders: ['aiReadability', 'digitalAuthority', 'conversionReadiness', 'ragReadiness'],
};

export interface Baseline {
  overallScore: number;
  pillarScores: Partial<AnalysisResponse['pillarScores']>;
  subScores?: Array<{ label: string; score: number }>;
  recommendations?: Array<{ text: string } | string>;
}

export interface ScoreView { overall: number; pillars: Array<{ key: string; label: string; score: number }> }

export interface PillarRewriteResult {
  rewritten: string;
  changes: string[];
  truncated: boolean;
  before: ScoreView;
  after: ScoreView;
  improved: boolean;
  passes: number;
  needsYou: NeedsYou[];
  faq: Array<{ q: string; a: string }>;
  schema: string | null;
  signals: RewriteSignal[];
  scored: AnalysisResponse; // the rewrite's full score, reused when it is accepted
}

const lane = (m: string) => (COUNTED[m] ? m : 'general');

export function scoreView(r: Baseline, module: string): ScoreView {
  const counted = COUNTED[lane(module)];
  return {
    overall: Math.round(r.overallScore || 0),
    pillars: PILLARS.filter(([k]) => counted.includes(k as string))
      .map(([k, label]) => ({ key: k as string, label, score: Math.round((r.pillarScores as any)?.[k] ?? 0) })),
  };
}

// What to aim the next pass at: the weakest sub-scores, counted pillars under
// 90, and the scorer's own recommendations.
export function focusFrom(r: Baseline, module: string): string[] {
  const subs = (r.subScores || [])
    .filter(s => typeof s?.score === 'number' && s.label)
    .sort((a, b) => a.score - b.score).slice(0, 4)
    .map(s => `${s.label} scored ${Math.round(s.score)}/100`);
  const pillars = scoreView(r, module).pillars.filter(p => p.score < 90).map(p => `${p.label} pillar is ${p.score}/100`);
  const recs = (r.recommendations || [])
    .map(x => (typeof x === 'string' ? x : x?.text || '')).filter(Boolean).slice(0, 4);
  return [...pillars, ...subs, ...recs].slice(0, 10);
}

// FAQ structured data (schema.org FAQPage) to paste into the page.
export function faqSchema(faq: Array<{ q: string; a: string }>): string | null {
  if (!faq.length) return null;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }, null, 2);
}

export async function pillarRewrite(
  content: string,
  module: string,
  opts: { industry?: string; contentType?: string; baseline?: Baseline | null; facts?: string } = {},
  deps = { analyze: analyzeContent, rewrite: rewriteDocumentForAI }
): Promise<PillarRewriteResult> {
  const industry = opts.industry || 'General / Other';
  const score = (text: string) => deps.analyze(text, industry, module as any, opts.contentType);
  const baseline: Baseline = opts.baseline ?? (await score(content));

  const first = await deps.rewrite(content, module, focusFrom(baseline, module), opts.contentType, opts.facts);
  const firstScore = await score(first.rewritten);
  let best = { r: first, s: firstScore };
  let passes = 1;

  if (firstScore.overallScore < TARGET) {
    passes = 2;
    const second = await deps.rewrite(first.rewritten, module, focusFrom(firstScore, module), opts.contentType, opts.facts).catch(() => null);
    const keepsLength = second && (isShortForm(opts.contentType) || wordCount(second.rewritten) >= MIN_REWRITE_RATIO * wordCount(content));
    if (second && keepsLength) {
      const secondScore = await score(second.rewritten).catch(() => null);
      if (secondScore && secondScore.overallScore > firstScore.overallScore) best = { r: second, s: secondScore };
    }
  }

  const seen = new Set<string>();
  const needsYou = [...first.needsYou, ...(best.r === first ? [] : best.r.needsYou)].filter(n => {
    const k = n.item.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const faq = (best.r.faq.length ? best.r.faq : first.faq).slice(0, 6);
  const before = scoreView(baseline, module);
  const after = scoreView(best.s, module);

  return {
    rewritten: best.r.rewritten,
    changes: Array.from(new Set([...first.changes, ...(best.r === first ? [] : best.r.changes)])).slice(0, 10),
    truncated: first.truncated,
    before,
    after,
    improved: after.overall > before.overall,
    passes,
    needsYou,
    faq,
    schema: faqSchema(faq),
    signals: rewriteSignals(content, best.r.rewritten),
    scored: best.s,
  };
}
