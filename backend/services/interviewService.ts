// services/interviewService.ts — "Write a post/article for this".
// Step 1 asks the writer a few interview questions about the reader's question.
// Step 2 drafts the piece from their answers only, so the draft carries their
// experience and facts instead of generic AI filler.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from './geminiRetry';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export const MAX_QUESTIONS = 5;
export type DraftKind = 'blog' | 'article';

export interface InterviewAnswer { question: string; answer: string }

function model() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });
}

function jsonSlice(text: string, open: string, close: string): unknown {
  const s = text.indexOf(open), e = text.lastIndexOf(close);
  if (s === -1 || e <= s) return null;
  try { return JSON.parse(text.slice(s, e + 1)); } catch { return null; }
}

export function buildQuestionsPrompt(question: string, kind: DraftKind): string {
  return [
    `A writer wants to publish a ${kind === 'article' ? 'in-depth article' : 'blog post'} that answers this reader question: "${question}"`,
    `Ask them ${MAX_QUESTIONS} short interview questions that pull out what only they know: their own experience, examples, numbers, opinions, mistakes and advice.`,
    'Plain language, one idea per question, no yes/no questions, no questions an AI could answer without them.',
    'Reply with only a JSON array of strings.',
  ].join('\n');
}

export function parseQuestions(text: string): string[] {
  const raw = jsonSlice(text, '[', ']');
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of raw) {
    const q = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
    if (q.length < 10 || q.length > 220 || seen.has(q.toLowerCase())) continue;
    seen.add(q.toLowerCase());
    out.push(q);
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}

export function buildDraftPrompt(question: string, answers: InterviewAnswer[], kind: DraftKind): string {
  return [
    `Write a ${kind === 'article' ? 'well-structured in-depth article (900-1400 words)' : 'blog post (600-900 words)'} that answers: "${question}"`,
    'Use ONLY the facts, experiences, examples and opinions in the writer\'s interview answers below. Do not invent statistics, quotes, clients, results or personal stories.',
    'Where the piece clearly needs something the answers do not give, write a short placeholder in square brackets, like [add an example from a recent project].',
    'Write in the first person, in the writer\'s voice. Make it easy for AI assistants to quote:',
    '- open with a direct 2-3 sentence answer to the question',
    '- use H2 headings (## in Markdown) phrased as the follow-up questions a reader would ask',
    '- short paragraphs, specific claims, lists where they help',
    '- end with a brief summary',
    'Interview:',
    ...answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`),
    'Reply with only JSON: {"title": "a specific title under 90 characters", "draft": "the full piece in Markdown"}',
  ].join('\n\n');
}

export function parseDraft(text: string): { title: string; draft: string } | null {
  const raw = jsonSlice(text, '{', '}') as { title?: unknown; draft?: unknown } | null;
  if (!raw || typeof raw.draft !== 'string' || raw.draft.trim().length < 200) return null;
  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, 140) : '';
  return { title, draft: raw.draft.trim() };
}

export async function interviewQuestions(question: string, kind: DraftKind): Promise<string[]> {
  const res = await generateContentWithRetry(model(), {
    contents: [{ role: 'user', parts: [{ text: buildQuestionsPrompt(question, kind) }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 1024, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } } as any,
  });
  return parseQuestions(res.response.text());
}

export async function draftFromInterview(question: string, answers: InterviewAnswer[], kind: DraftKind) {
  const res = await generateContentWithRetry(model(), {
    contents: [{ role: 'user', parts: [{ text: buildDraftPrompt(question, answers, kind) }] }],
    // Thinking tokens share this limit and would cut the draft off.
    generationConfig: { temperature: 0.5, maxOutputTokens: 8192, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } } as any,
  }, { timeoutMs: 90000 });
  return parseDraft(res.response.text());
}
