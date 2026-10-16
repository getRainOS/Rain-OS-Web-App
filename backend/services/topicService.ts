// services/topicService.ts — guided topic drill-down and the questions readers ask AI about a topic.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from './geminiRetry';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type TopicLevel = 'field' | 'niche' | 'angle';
export const LEVELS: TopicLevel[] = ['field', 'niche', 'angle'];
export const MAX_OPTIONS = 6;
export const MAX_QUESTIONS = 12;
export const MAX_PATH = 3;

export interface TopicQuestion {
  question: string;
  intent: 'discover' | 'compare' | 'decide' | 'learn';
}
const INTENTS = new Set(['discover', 'compare', 'decide', 'learn']);

const tidy = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().replace(/^["'“]|["'”]$/g, '').slice(0, max) : '';

function firstJsonArray(text: string): unknown[] {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end <= start) return [];
  try {
    const raw = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function parseOptions(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of firstJsonArray(text)) {
    const label = tidy(typeof item === 'string' ? item : (item as any)?.label, 60);
    if (label.length < 2) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= MAX_OPTIONS) break;
  }
  return out;
}

export function parseTopicQuestions(text: string): TopicQuestion[] {
  const seen = new Set<string>();
  const out: TopicQuestion[] = [];
  for (const item of firstJsonArray(text)) {
    const question = tidy(typeof item === 'string' ? item : (item as any)?.question, 200);
    if (question.length < 8) continue;
    const key = question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = typeof item === 'object' && item ? String((item as any).intent || '').toLowerCase() : '';
    out.push({ question, intent: (INTENTS.has(raw) ? raw : 'learn') as TopicQuestion['intent'] });
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}

const LANE_WHO: Record<string, string> = {
  general: 'a blogger, article writer or content marketer',
  product_sellers: 'a seller who writes content to support an online store',
  developers: 'a developer who writes technical posts and documentation',
  vibe_coders: 'a builder who writes about apps made with AI coding tools',
  local_business: 'a local business owner who writes for nearby customers',
};

export function buildOptionsPrompt(input: { level: TopicLevel; path: string[]; lane: string; site: string | null; known: string[] }): string {
  const who = LANE_WHO[input.lane] || LANE_WHO.general;
  const ask = input.level === 'field'
    ? 'the broad industries or fields they most likely write about'
    : input.level === 'niche'
    ? `specific niches within "${input.path[0]}"`
    : `audiences and angles for writing about "${input.path[input.path.length - 1]}" (who it is for and what slant to take)`;
  return [
    `The user is ${who}.`,
    input.site ? `Their website: ${input.site}` : '',
    input.known.length ? `Things they have already written or checked: ${input.known.map(k => `"${k}"`).join('; ')}` : '',
    input.path.length ? `Chosen so far: ${input.path.join(' > ')}` : '',
    `Suggest ${MAX_OPTIONS} options for ${ask}. Make them specific and distinct, 1 to 5 words each, in plain language. If the things they already wrote point to a field, put the best match first.`,
    'Reply with only a JSON array of strings.',
  ].filter(Boolean).join('\n');
}

export function buildQuestionsPrompt(input: { path: string[]; lane: string; kind: string }): string {
  const who = LANE_WHO[input.lane] || LANE_WHO.general;
  return [
    `The user is ${who}. They write about: ${input.path.join(' > ')}.`,
    `Write ${MAX_QUESTIONS} questions that real readers would type into an AI assistant like ChatGPT or Gemini, which a ${input.kind === 'article' ? 'in-depth article' : input.kind === 'blog' ? 'blog post' : 'blog post or article'} on this topic could answer well.`,
    'Rules:',
    '- Plain language, the way people actually ask, 6 to 16 words.',
    '- Do not name any company or website in the questions.',
    '- Mix intents: learn (how to, what is), discover (what are the options), compare (X vs Y), decide (is it worth it, which should I pick).',
    '- Cover different sub-topics, not variations of one question.',
    'Reply with only a JSON array of objects: [{"question":"...","intent":"learn|discover|compare|decide"}]',
  ].join('\n');
}

async function run(prompt: string, maxOutputTokens: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });
  const result = await generateContentWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      // Thinking tokens share this limit and can cut the JSON list off.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens,
      responseMimeType: 'application/json',
    },
  });
  return result.response.text();
}

export async function suggestTopicOptions(input: { level: TopicLevel; path: string[]; lane: string; site: string | null; known: string[] }): Promise<string[]> {
  return parseOptions(await run(buildOptionsPrompt(input), 1024));
}

export async function suggestTopicQuestions(input: { path: string[]; lane: string; kind: string }): Promise<TopicQuestion[]> {
  return parseTopicQuestions(await run(buildQuestionsPrompt(input), 3072));
}
