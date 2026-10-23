// services/contentTypes.ts — one scorecard per content type, inside the same pillars.
//   The pillars and lane weights never change. What changes per type:
//   - measured checks: which exact readability measurements apply, and their
//     targets (a social post isn't marked down for having no headings);
//   - judged criteria: sub-scores that don't apply are dropped, and criteria
//     that matter for the type are added under the pillar they feed.
// Measured checks are also the fixes the user can tick off: each one is
// re-measured on edited text, so a fix disappears when it is actually done.
import type { ReadabilityMetrics } from './readability';

export type ContentTypeId = 'article' | 'blog_post' | 'product_description' | 'landing_page' | 'documentation' | 'social_post';
export type PillarKey = 'ai_readability' | 'digital_authority' | 'conversion_readiness' | 'product_discoverability' | 'rag_readiness' | 'local_presence';

export function contentTypeId(label?: string | null): ContentTypeId | null {
  const s = String(label || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  const ids: ContentTypeId[] = ['article', 'blog_post', 'product_description', 'landing_page', 'documentation', 'social_post'];
  if ((ids as string[]).includes(s)) return s as ContentTypeId;
  if (s.startsWith('social')) return 'social_post';
  if (s.startsWith('blog')) return 'blog_post';
  if (s.startsWith('product')) return 'product_description';
  if (s.startsWith('landing')) return 'landing_page';
  if (s.startsWith('doc')) return 'documentation';
  return null;
}

// ─── Measured checks ─────────────────────────────────────────────────────────
interface Measure {
  key: string;
  label: string;
  pillar: PillarKey;
  value: (m: ReadabilityMetrics, text: string) => number;
  display: (v: number) => string;
  min?: number;
  max?: number;
  fix: (v: number, t: { min?: number; max?: number }) => string;
}

const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
const per100 = (v: number) => `${v.toFixed(2)} per 100 words`;

const MEASURES: Record<string, Omit<Measure, 'min' | 'max'>> = {
  avgSentenceLength: {
    key: 'avgSentenceLength', label: 'Average sentence length', pillar: 'ai_readability',
    value: m => m.avgSentenceLength, display: v => `${v.toFixed(1)} words`,
    fix: (v, t) => `Shorten your sentences: they average ${v.toFixed(0)} words; aim for ${t.max} or fewer. Split any sentence that joins two ideas with "and", "which" or a comma.`,
  },
  longSentenceRatio: {
    key: 'longSentenceRatio', label: 'Sentences over 30 words', pillar: 'ai_readability',
    value: m => m.longSentenceRatio, display: pct,
    fix: (v, t) => `${pct(v)} of your sentences run over 30 words; get that under ${pct(t.max!)}. AI tools quote short sentences and skip long ones.`,
  },
  passiveVoiceRatio: {
    key: 'passiveVoiceRatio', label: 'Passive voice', pillar: 'ai_readability',
    value: m => m.passiveVoiceRatio, display: pct,
    fix: (v, t) => `${pct(v)} of sentences are passive ("was done by"); get it under ${pct(t.max!)}. Name who does what: "We ship in 2 days", not "Orders are shipped".`,
  },
  coreferenceLeaks: {
    key: 'coreferenceLeaks', label: 'Unclear "it/this/they"', pillar: 'ai_readability',
    value: (m) => (m.wordCount ? (m.coreferenceLeakCount / m.wordCount) * 100 : 0), display: per100,
    fix: (v, t) => `Too many sentences start with "it", "this" or "they" (${v.toFixed(1)} per 100 words; aim for ${t.max} or fewer). AI quotes one sentence at a time, so name the thing again.`,
  },
  abstractionRatio: {
    key: 'abstractionRatio', label: 'Vague words', pillar: 'ai_readability',
    value: m => m.abstractionRatio, display: pct,
    fix: (v, t) => `${pct(v)} of your words are vague ("things", "various", "aspects"); get it under ${pct(t.max!)}. Replace each with the specific thing, number or name.`,
  },
  nestedClauseDepth: {
    key: 'nestedClauseDepth', label: 'Commas per sentence', pillar: 'ai_readability',
    value: m => m.nestedClauseDepth, display: v => v.toFixed(1),
    fix: (v, t) => `Sentences carry ${v.toFixed(1)} commas on average (aim for ${t.max} or fewer). Break stacked clauses into separate sentences.`,
  },
  headingDensity: {
    key: 'headingDensity', label: 'Headings', pillar: 'ai_readability',
    value: m => m.headingDensity, display: per100,
    fix: (v, t) => (v < (t.min ?? 0)
      ? `Add headings: you have ${v.toFixed(2)} per 100 words; aim for at least ${t.min} (one every ${Math.round(100 / (t.min || 1))} words or so). Phrase them as the question the section answers.`
      : `Too many headings (${v.toFixed(2)} per 100 words; aim for ${t.max} or fewer). Merge thin sections.`),
  },
  qaDensity: {
    key: 'qaDensity', label: 'Questions answered', pillar: 'rag_readiness',
    value: m => m.qaDensity, display: pct,
    fix: () => 'Add a short FAQ: 3 to 5 questions your readers actually ask, each answered in one or two sentences right underneath.',
  },
  listItemRatio: {
    key: 'listItemRatio', label: 'List items', pillar: 'rag_readiness',
    value: m => m.listItemRatio, display: per100,
    fix: (v, t) => `Put the key facts in a bulleted or numbered list (${v.toFixed(2)} list items per 100 words now; aim for at least ${t.min}). AI pulls lists into answers almost word for word.`,
  },
  answerFirstRatio: {
    key: 'answerFirstRatio', label: 'Sections that answer first', pillar: 'ai_readability',
    value: m => m.answerFirstRatio, display: pct,
    fix: (v, t) => `Only ${pct(v)} of sections open with the answer; aim for ${pct(t.min!)}. Put the direct answer in the first sentence under each heading, then explain.`,
  },
  characters: {
    key: 'characters', label: 'Length', pillar: 'conversion_readiness',
    value: (_m, text) => text.trim().length, display: v => `${Math.round(v).toLocaleString('en-US')} characters`,
    fix: (v, t) => `Cut it to under ${t.max!.toLocaleString('en-US')} characters (it's ${Math.round(v).toLocaleString('en-US')}). LinkedIn shows about 210 before "see more" and X allows 280: lead with the hook, keep one idea, or split it into a thread.`,
  },
  words: {
    key: 'words', label: 'Length', pillar: 'conversion_readiness',
    value: m => m.wordCount, display: v => `${Math.round(v).toLocaleString('en-US')} words`,
    fix: (v, t) => `Trim it to under ${t.max} words (it's ${Math.round(v)}). Keep the facts shoppers and AI need at the top; move the long story to another page.`,
  },
};

type Target = { min?: number; max?: number; minWords?: number };
const LONG_FORM: Record<string, Target> = {
  avgSentenceLength: { max: 20 }, longSentenceRatio: { max: 0.2 }, passiveVoiceRatio: { max: 0.3 },
  coreferenceLeaks: { max: 1.5 }, abstractionRatio: { max: 0.05 }, nestedClauseDepth: { max: 3 },
  headingDensity: { min: 0.5, max: 2.5, minWords: 150 }, answerFirstRatio: { min: 0.4, minWords: 150 },
  qaDensity: { min: 0.02, minWords: 300 },
};
const TARGETS: Record<ContentTypeId | 'default', Record<string, Target>> = {
  default: LONG_FORM,
  article: LONG_FORM,
  blog_post: LONG_FORM,
  documentation: { ...LONG_FORM, listItemRatio: { min: 1, minWords: 150 } },
  landing_page: {
    avgSentenceLength: { max: 18 }, longSentenceRatio: { max: 0.15 }, passiveVoiceRatio: { max: 0.2 },
    coreferenceLeaks: { max: 1.5 }, abstractionRatio: { max: 0.05 }, nestedClauseDepth: { max: 2.5 },
    headingDensity: { min: 0.5, max: 4, minWords: 120 },
  },
  product_description: {
    avgSentenceLength: { max: 20 }, longSentenceRatio: { max: 0.15 }, passiveVoiceRatio: { max: 0.25 },
    abstractionRatio: { max: 0.05 }, listItemRatio: { min: 1, minWords: 80 }, words: { max: 400 },
  },
  social_post: {
    avgSentenceLength: { max: 18 }, longSentenceRatio: { max: 0.1 }, passiveVoiceRatio: { max: 0.2 },
    abstractionRatio: { max: 0.05 }, characters: { max: 1300 },
  },
};

export interface MeasuredCheck {
  key: string;
  label: string;
  pillar: PillarKey;
  value: number;
  display: string;
  target: string;
  pass: boolean;
}

export function measuredChecks(m: ReadabilityMetrics, text: string, type: ContentTypeId | null): MeasuredCheck[] {
  const targets = TARGETS[type || 'default'];
  const out: MeasuredCheck[] = [];
  for (const [key, t] of Object.entries(targets)) {
    const def = MEASURES[key];
    if (!def) continue;
    if (t.minWords && m.wordCount < t.minWords) continue; // too short for this to matter
    const raw = def.value(m, text);
    const value = Number.isFinite(raw) ? raw : 0;
    const pass = (t.min === undefined || value >= t.min) && (t.max === undefined || value <= t.max);
    const target = t.min !== undefined && t.max !== undefined ? `${def.display(t.min)} to ${def.display(t.max)}`
      : t.max !== undefined ? `${def.display(t.max)} or less` : `${def.display(t.min!)} or more`;
    out.push({ key, label: def.label, pillar: def.pillar, value, display: def.display(value), target, pass });
  }
  return out;
}

// ─── Fixes ───────────────────────────────────────────────────────────────────
// source "measured": re-checked exactly on any edit. source "judged": from the
// scorer, tied to a sub-score, confirmed by the next analysis.
export interface Fix {
  id: string;
  pillar: PillarKey | null;
  text: string;
  source: 'measured' | 'judged';
  metric?: string;
  sub?: string;
}

export function measuredFixes(m: ReadabilityMetrics, text: string, type: ContentTypeId | null): Fix[] {
  const targets = TARGETS[type || 'default'];
  return measuredChecks(m, text, type).filter(c => !c.pass).map(c => ({
    id: `m:${c.key}`,
    pillar: c.pillar,
    source: 'measured' as const,
    metric: c.key,
    text: MEASURES[c.key].fix(c.value, targets[c.key]),
  }));
}

// What the scorer should leave to the measured fixes, so the list never says
// the same thing twice.
export const MEASURED_TOPICS = 'sentence length, long sentences, passive voice, ambiguous pronouns ("it/this/they"), vague words, commas per sentence, heading count, list items, FAQ/question count, opening with the answer, and overall length';

// ─── Judged criteria per type ────────────────────────────────────────────────
interface Criterion { key: string; label: string; pillar: PillarKey; desc: string }
const DETAIL_OF: Record<PillarKey, string> = {
  ai_readability: 'ai_readability_detail', digital_authority: 'digital_authority_detail',
  conversion_readiness: 'conversion_readiness_detail', product_discoverability: 'product_discoverability_detail',
  rag_readiness: 'rag_readiness_detail', local_presence: 'local_presence_detail',
};

const CRITERIA: Partial<Record<ContentTypeId, Criterion[]>> = {
  social_post: [
    { key: 'hookStrength', label: 'Hook', pillar: 'ai_readability', desc: 'Does the first line make the point or stop the scroll on its own?' },
    { key: 'singleClearIdea', label: 'One clear idea', pillar: 'ai_readability', desc: 'Is there exactly one idea, not several buried points?' },
    { key: 'standaloneTakeaway', label: 'Quotable takeaway', pillar: 'rag_readiness', desc: 'Could an AI quote one sentence word for word and have it make sense with no context?' },
    { key: 'platformFit', label: 'Platform fit', pillar: 'conversion_readiness', desc: 'Natural, conversational tone for a social feed, not press-release phrasing.' },
  ],
  landing_page: [
    { key: 'aboveTheFoldClarity', label: 'Clear at a glance', pillar: 'conversion_readiness', desc: 'Do the headline and first lines say what it is, who it is for and why it matters?' },
    { key: 'proofSpecificity', label: 'Specific proof', pillar: 'digital_authority', desc: 'Numbers, named customers, testimonials, results, rather than vague claims.' },
    { key: 'objectionHandling', label: 'Objections answered', pillar: 'conversion_readiness', desc: 'Price, risk, time, "will it work for me": are they answered on the page?' },
    { key: 'audienceClarity', label: 'Who it is for', pillar: 'ai_readability', desc: 'Is the exact audience named, so AI can recommend it for the right question?' },
  ],
  documentation: [
    { key: 'stepClarity', label: 'Clear steps', pillar: 'ai_readability', desc: 'Numbered, one-action steps with prerequisites stated first.' },
    { key: 'codeExampleCompleteness', label: 'Runnable examples', pillar: 'digital_authority', desc: 'Code that can be copied and run as-is, with the expected output.' },
    { key: 'errorCaseCoverage', label: 'Errors covered', pillar: 'rag_readiness', desc: 'Common errors and edge cases, with what to do about each.' },
  ],
  product_description: [
    { key: 'specsAsFacts', label: 'Specs as facts', pillar: 'product_discoverability', desc: 'Dimensions, materials, compatibility stated with numbers and units, not adjectives.' },
    { key: 'bestForClarity', label: 'Who it is best for', pillar: 'conversion_readiness', desc: 'Is it clear who should buy it and who should not?' },
  ],
};

const NOT_APPLICABLE: Partial<Record<ContentTypeId, string[]>> = {
  social_post: ['sectionConceptIsolation', 'hierarchicalFormatting', 'explicitQaStructures', 'freshnessSignals', 'citationSignals', 'frictionReduction', 'narrativeNuance'],
  landing_page: ['narrativeNuance', 'freshnessSignals'],
  product_description: ['narrativeNuance', 'freshnessSignals', 'hierarchicalFormatting'],
  documentation: ['socialProofMarkup', 'valueProposition'],
};

export const typeCriteria = (type: ContentTypeId | null): Criterion[] => (type && CRITERIA[type]) || [];
export const notApplicable = (type: ContentTypeId | null): string[] => (type && NOT_APPLICABLE[type]) || [];

// Prompt block for the scorer: the type's own criteria, and what not to judge.
export function typeScorecardPrompt(type: ContentTypeId | null): string {
  const crit = typeCriteria(type);
  const na = notApplicable(type);
  if (!crit.length && !na.length) return '';
  return [
    '=== CONTENT-TYPE SCORECARD ===',
    ...(crit.length ? [
      'Score each of these 0-100 in "content_type_detail" (an object keyed by these names). Each one counts toward the pillar shown, alongside its other sub-scores:',
      ...crit.map(c => `- ${c.key} (${c.pillar}): ${c.desc}`),
    ] : []),
    ...(na.length ? [`These sub-scores do not apply to this content type. Set them to null and do not let their absence lower any pillar: ${na.join(', ')}.`] : []),
    '=== END CONTENT-TYPE SCORECARD ===',
  ].join('\n');
}

// Move the type's criteria into their pillars' breakdowns and drop the ones
// that don't apply, so the breakdown under each pillar is the type's scorecard.
export function applyTypeScorecard(parsed: any, type: ContentTypeId | null): void {
  const na = new Set(notApplicable(type));
  for (const detailKey of Object.values(DETAIL_OF)) {
    const d = parsed?.[detailKey];
    if (d && typeof d === 'object') for (const k of Object.keys(d)) if (na.has(k) || d[k] === null) delete d[k];
  }
  const ctd = parsed?.content_type_detail || {};
  for (const c of typeCriteria(type)) {
    const v = Number(ctd[c.key]);
    if (!Number.isFinite(v)) continue;
    const dk = DETAIL_OF[c.pillar];
    parsed[dk] = { ...(parsed[dk] || {}), [c.key]: Math.max(0, Math.min(100, Math.round(v))) };
  }
  delete parsed?.content_type_detail;
}

// ─── Fix status ──────────────────────────────────────────────────────────────
// done: true/false when we know; null when only a new analysis can tell
// (a judged fix on edited text that hasn't been scored yet).
export interface FixStatus { id: string; done: boolean | null; now?: string }

export function fixStatus(
  fixes: Array<Pick<Fix, 'id' | 'source' | 'metric' | 'sub'>>,
  metrics: ReadabilityMetrics,
  text: string,
  type: ContentTypeId | null,
  scored?: { recommendations?: Array<{ sub?: string }>; [k: string]: any } | null,
): FixStatus[] {
  const checks = new Map(measuredChecks(metrics, text, type).map(c => [c.key, c]));
  return fixes.map(f => {
    if (f.source === 'measured' && f.metric) {
      const c = checks.get(f.metric);
      // A check that no longer applies (e.g. text now too short for headings) is done.
      return { id: f.id, done: c ? c.pass : true, ...(c ? { now: c.display } : {}) };
    }
    if (scored && f.sub) {
      let value: number | undefined;
      for (const dk of Object.values(DETAIL_OF)) {
        const v = scored[dk]?.[f.sub];
        if (typeof v === 'number') value = v;
      }
      const stillListed = (scored.recommendations || []).some(r => r?.sub === f.sub);
      return { id: f.id, done: !stillListed && (value === undefined || value >= 70) };
    }
    return { id: f.id, done: null };
  });
}
