// services/contentIdeasService.ts — post and article ideas for a topic, or related to something the user wrote.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from './geminiRetry';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type IdeaKind = 'blog' | 'article' | 'any';

export interface ContentIdea {
  title: string;
  angle: string;
  question: string;
  format: 'blog' | 'article';
}

export const MAX_IDEAS = 10;
const MAX_WRITING_CHARS = 6000;

export function parseIdeas(text: string): ContentIdea[] {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end <= start) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  const clean = (v: unknown, max: number) =>
    typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().replace(/^["'“]|["'”]$/g, '').slice(0, max) : '';
  const seen = new Set<string>();
  const out: ContentIdea[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const title = clean((item as any).title, 140);
    if (title.length < 8) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const format = String((item as any).format || '').toLowerCase() === 'article' ? 'article' : 'blog';
    out.push({ title, angle: clean((item as any).angle, 240), question: clean((item as any).question, 200), format });
    if (out.length >= MAX_IDEAS) break;
  }
  return out;
}

export function buildIdeasPrompt(input: { topic: string | null; writing: string | null; kind: IdeaKind; audience: string | null }): string {
  const kindLine = input.kind === 'blog'
    ? 'Every idea should be a blog post (conversational, one clear takeaway).'
    : input.kind === 'article'
    ? 'Every idea should be an in-depth article (researched, structured, authoritative).'
    : 'Mix blog posts and in-depth articles.';
  return [
    'You are an editor planning content that AI assistants like ChatGPT and Gemini will quote and cite.',
    input.topic ? `Topic or niche: ${input.topic}` : '',
    input.audience ? `Who it is for: ${input.audience}` : '',
    input.writing
      ? `The writer already wrote the piece below. Suggest ${MAX_IDEAS} NEW pieces that cover related ground it does not already cover: follow-ups, adjacent questions, deeper dives, beginner versions. Do not repeat what it already says.\n---\n${input.writing}\n---`
      : `Suggest ${MAX_IDEAS} distinct pieces on this topic.`,
    kindLine,
    'For each idea give:',
    '- title: a specific working title, under 90 characters, no clickbait',
    '- angle: one sentence on what makes this piece worth reading',
    '- question: the plain-language question a reader would ask an AI assistant that this piece answers',
    '- format: "blog" or "article"',
    'Reply with only a JSON array: [{"title":"...","angle":"...","question":"...","format":"blog|article"}]',
  ].filter(Boolean).join('\n');
}

export async function suggestContentIdeas(input: {
  topic: string | null;
  writing: string | null;
  kind: IdeaKind;
  audience: string | null;
}): Promise<ContentIdea[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });
  const writing = input.writing ? input.writing.slice(0, MAX_WRITING_CHARS) : null;
  const result = await generateContentWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: buildIdeasPrompt({ ...input, writing }) }] }],
    generationConfig: {
      temperature: 0.8,
      // Thinking tokens share this limit and can cut the JSON list off.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });
  return parseIdeas(result.response.text());
}
