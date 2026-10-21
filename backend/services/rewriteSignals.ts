// services/rewriteSignals.ts — the measurable signals before and after a
// rewrite, from the same exact text measurements the score is anchored on
// (services/readability.ts). Deterministic: no AI involved.
import { computeReadabilityMetrics, type ReadabilityMetrics } from './readability';

export interface RewriteSignal { label: string; before: string; after: string; better: boolean | null }

type Spec = { label: string; get: (m: ReadabilityMetrics) => number; fmt: (n: number) => string; goal: 'lower' | 'higher' | ((n: number) => number) };

const pct = (n: number) => `${Math.round(n * 100)}%`;
const SPECS: Spec[] = [
  { label: 'Average sentence length', get: m => m.avgSentenceLength, fmt: n => `${n} words`, goal: n => Math.abs(n - 17.5) },
  { label: 'Sentences over 30 words', get: m => m.longSentenceRatio, fmt: pct, goal: 'lower' },
  { label: 'Passive voice', get: m => m.passiveVoiceRatio, fmt: pct, goal: 'lower' },
  { label: 'Vague words', get: m => m.abstractionRatio, fmt: pct, goal: 'lower' },
  { label: 'Ambiguous pronouns', get: m => m.coreferenceLeakCount, fmt: n => String(n), goal: 'lower' },
  { label: 'Answer-first sentences', get: m => m.answerFirstRatio, fmt: pct, goal: 'higher' },
  { label: 'Headings per 100 words', get: m => m.headingDensity, fmt: n => n.toFixed(1), goal: n => (n >= 0.5 && n <= 2 ? 0 : n < 0.5 ? 0.5 - n : n - 2) },
  { label: 'Word count', get: m => m.wordCount, fmt: n => String(n), goal: () => 0 },
];

export function rewriteSignals(before: string, after: string): RewriteSignal[] {
  const a = computeReadabilityMetrics(before);
  const b = computeReadabilityMetrics(after);
  return SPECS.map(s => {
    const x = s.get(a), y = s.get(b);
    let better: boolean | null = null;
    if (x !== y) {
      if (s.goal === 'lower') better = y < x;
      else if (s.goal === 'higher') better = y > x;
      else { const dx = s.goal(x), dy = s.goal(y); better = dx === dy ? null : dy < dx; }
    }
    if (s.label === 'Word count') better = null;
    return { label: s.label, before: s.fmt(x), after: s.fmt(y), better };
  });
}
