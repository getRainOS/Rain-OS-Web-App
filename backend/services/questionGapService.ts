// services/questionGapService.ts — question-targeted advice: compare a business
// with the sources Gemini actually cited for one question, and say what to change.
import { recordGroundedCall } from './groundingUsage';
import { GoogleGenerativeAI, type GenerativeModel, type Tool } from '@google/generative-ai';
import { generateContentWithRetry } from './geminiRetry';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type GapMode = 'citation' | 'share_of_voice' | 'sentiment';
export type GapPillar =
  | 'AI Readability' | 'Digital Authority' | 'Conversion Readiness'
  | 'Product Discoverability' | 'Local Presence' | 'RAG Readiness';

export interface GapSource { domain: string; title?: string; snippet?: string }

export interface GapAction {
  pillar: GapPillar;
  where: 'on_page' | 'off_site';
  title: string;
  why: string;
  fix: string;
}

export interface QuestionGap {
  headline: string;
  pageRead: boolean;
  whatCitedPagesDo: string[];
  actions: GapAction[];
  draftAnswer: string | null;
}

const PILLARS: GapPillar[] = [
  'AI Readability', 'Digital Authority', 'Conversion Readiness',
  'Product Discoverability', 'Local Presence', 'RAG Readiness',
];

export const MAX_SOURCES = 8;
export const MAX_ACTIONS = 6;
export const MAX_CONTENT_CHARS = 8000;

const GOAL: Record<GapMode, string> = {
  citation: 'Get their own site cited among the sources Gemini uses when it answers this question.',
  share_of_voice: 'Get their brand named in the answers Gemini gives to this question, ahead of competitors.',
  sentiment: 'Improve how Gemini describes their brand when it answers this question.',
};

const clip = (v: unknown, n: number): string =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '';

export function parseQuestionGap(text: string): QuestionGap | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  let raw: any;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;

  const actions: GapAction[] = [];
  for (const a of Array.isArray(raw.actions) ? raw.actions : []) {
    const title = clip(a?.title, 140);
    const fix = clip(a?.fix, 500);
    if (!title || !fix) continue;
    actions.push({
      pillar: PILLARS.includes(a?.pillar) ? a.pillar : 'AI Readability',
      where: a?.where === 'off_site' ? 'off_site' : 'on_page',
      title,
      why: clip(a?.why, 300),
      fix,
    });
    if (actions.length >= MAX_ACTIONS) break;
  }
  if (!actions.length) return null;

  const patterns = (Array.isArray(raw.whatCitedPagesDo) ? raw.whatCitedPagesDo : [])
    .map((p: unknown) => clip(p, 240)).filter(Boolean).slice(0, 4);
  const draft = clip(raw.draftAnswer, 700);

  return {
    headline: clip(raw.headline, 240) || 'Here is what to change to improve your chances for this question.',
    pageRead: raw.pageRead === true,
    whatCitedPagesDo: patterns,
    actions,
    draftAnswer: draft || null,
  };
}

export interface GapInput {
  question: string;
  mode: GapMode;
  brand: string | null;
  domain: string | null;
  content: string | null;
  sources: GapSource[];
  competitors: string[];
  cited: boolean | null;     // null = unknown (no site given)
  rank: number | null;
  note: string | null;       // e.g. the sentiment explanation
}

export function buildPrompt(i: GapInput): string {
  const result =
    i.cited === null ? 'Unknown, because no website was given to match against the sources.'
    : i.cited ? `Their site was cited${i.rank ? ` at position ${i.rank} of ${i.sources.length}` : ''}.`
    : 'Their site was not among the cited sources.';
  const sourceLines = i.sources.slice(0, MAX_SOURCES).map((s, n) =>
    `${n + 1}. ${s.domain}${s.title ? ` | ${s.title}` : ''}${s.snippet ? ` | "${s.snippet}"` : ''}`);
  const page = i.content
    ? `THEIR PAGE (excerpt):\n"""\n${i.content.slice(0, MAX_CONTENT_CHARS)}\n"""`
    : i.domain
    ? `THEIR PAGE: not pasted. Look up ${i.domain} yourself and judge it. Set pageRead to true only if you could actually read it.`
    : 'THEIR PAGE: not provided. Give advice that does not depend on seeing it, and set pageRead to false.';

  return [
    'You are helping a small business get chosen by AI assistants for one specific question.',
    `QUESTION: "${i.question}"`,
    `GOAL: ${GOAL[i.mode]}`,
    i.brand ? `BRAND: ${i.brand}` : '',
    i.domain ? `THEIR SITE: ${i.domain}` : 'THEIR SITE: not given',
    `CURRENT RESULT: ${result}`,
    i.note ? `NOTE: ${clip(i.note, 300)}` : '',
    sourceLines.length ? `SOURCES GEMINI ACTUALLY CITED FOR THIS QUESTION, in order:\n${sourceLines.join('\n')}` : 'SOURCES: none were returned.',
    i.competitors.length ? `COMPETITORS NAMED OR CITED: ${i.competitors.slice(0, MAX_SOURCES).join(', ')}` : '',
    page,
    '',
    'RULES:',
    '- whatCitedPagesDo: patterns you can support from the listed sources and snippets only. Do not claim things about pages you cannot see. If the snippets say little, return fewer patterns.',
    `- actions: ${MAX_ACTIONS} at most, most important first. Each must be specific to this question and written in plain language for a non-technical owner. Do not give generic SEO advice.`,
    '- Mark where each action happens: "on_page" (change their own page) or "off_site" (get listed, reviewed or mentioned on another site, especially one that appears in the sources).',
    `- pillar must be one of: ${PILLARS.join(', ')}.`,
    '- Do not promise results. AI answers vary.',
    '- draftAnswer: an answer-first opening paragraph of at most 90 words they could put at the top of the page. Use only facts from their page or the question. For anything you do not know, write a bracketed placeholder such as [your price] or [your city]. Never invent facts. Use null if you cannot write one honestly.',
    '',
    'Reply with only JSON: {"headline": "...", "pageRead": true|false, "whatCitedPagesDo": ["..."], "actions": [{"pillar": "...", "where": "on_page|off_site", "title": "...", "why": "...", "fix": "..."}], "draftAnswer": "..."|null}',
  ].filter(Boolean).join('\n');
}

async function callModel(input: GapInput, grounded: boolean): Promise<QuestionGap | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
  const client = new GoogleGenerativeAI(apiKey);
  const model: GenerativeModel = client.getGenerativeModel({
    model: MODEL,
    ...(grounded ? { tools: [{ googleSearch: {} }] as unknown as Tool[] } : {}),
  });
  const result = await generateContentWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(input) }] }],
    generationConfig: {
      temperature: 0.4,
      // Room for the whole JSON answer, and no hidden "thinking" tokens eating
      // the budget: with a small limit they truncated the JSON mid-way.
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      ...(grounded ? {} : { responseMimeType: 'application/json' }),
    },
  }, { timeoutMs: grounded ? 60000 : 30000 });
  if (grounded) recordGroundedCall('improve_question');
  const text = result.response.text();
  const gap = parseQuestionGap(text);
  if (!gap) {
    const finish = (result.response as any)?.candidates?.[0]?.finishReason;
    console.error(`[question-gap] unusable reply grounded=${grounded} finishReason=${finish ?? 'unknown'} length=${text.length} head=${JSON.stringify(text.slice(0, 200))}`);
  }
  return gap;
}

export async function analyzeQuestionGap(input: GapInput): Promise<QuestionGap | null> {
  // Google fetches their page through grounding, so our server never requests user URLs.
  const grounded = !input.content && !!input.domain;
  const first = await callModel(input, grounded);
  if (first || !grounded) return first;
  // A grounded reply can come back wrapped in prose or cut off. Rather than
  // fail, answer again without the page lookup (JSON mode is reliable); the
  // result then says the page was not read.
  const fallback = await callModel(input, false);
  // We never read their page on this path, whatever the model claims.
  return fallback ? { ...fallback, pageRead: false } : null;
}
