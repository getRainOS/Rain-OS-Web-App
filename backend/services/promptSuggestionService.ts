// services/promptSuggestionService.ts — suggest questions a business's customers ask AI.
import { GoogleGenerativeAI, type GenerativeModel, type Tool } from '@google/generative-ai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type SuggestionLane = 'general' | 'product_sellers' | 'developers' | 'vibe_coders' | 'local_business';

export interface PromptSuggestion {
  question: string;
  intent: 'discover' | 'compare' | 'decide' | 'learn';
}

const LANE_CONTEXT: Record<SuggestionLane, string> = {
  general: 'a content publisher, blogger or marketing team',
  product_sellers: 'an online store selling products',
  developers: 'a software project, developer tool or API',
  vibe_coders: 'an app or website recently built with AI coding tools',
  local_business: 'a local service business that customers find nearby',
};

const INTENTS = new Set(['discover', 'compare', 'decide', 'learn']);
export const MAX_SUGGESTIONS = 8;

// Pulls the first JSON array out of a model reply (grounded replies can't be
// forced into JSON mode, so they may arrive wrapped in prose or fences).
export function parseSuggestions(text: string): PromptSuggestion[] {
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
  const seen = new Set<string>();
  const out: PromptSuggestion[] = [];
  for (const item of raw) {
    const q = typeof item === 'string' ? item : (item as any)?.question;
    if (typeof q !== 'string') continue;
    const question = q.replace(/\s+/g, ' ').trim().replace(/^["'“]|["'”]$/g, '');
    if (question.length < 8 || question.length > 200) continue;
    const key = question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const intentRaw = typeof item === 'object' && item ? String((item as any).intent || '').toLowerCase() : '';
    out.push({ question, intent: (INTENTS.has(intentRaw) ? intentRaw : 'discover') as PromptSuggestion['intent'] });
    if (out.length >= MAX_SUGGESTIONS) break;
  }
  return out;
}

export function buildPrompt(input: { domain: string | null; description: string | null; location: string | null; lane: SuggestionLane }): string {
  const lines = [
    `You help ${LANE_CONTEXT[input.lane]} understand what their potential customers ask AI assistants like ChatGPT and Gemini.`,
    input.domain ? `Their website: ${input.domain}` : '',
    input.description ? `How they describe the business: ${input.description}` : '',
    input.location ? `Where they operate: ${input.location}` : '',
    input.domain && !input.description ? 'Look the website up to learn what it offers before writing questions.' : '',
    '',
    `Write ${MAX_SUGGESTIONS} questions a real potential customer would type into an AI assistant when they need what this business offers.`,
    'Rules:',
    '- Write them the way people actually ask, in plain language, 6 to 16 words.',
    '- Do not include the business\'s own name or website in any question. These must be questions where the business would hope to be recommended.',
    '- Mix intents: discover (what are the options), compare (X vs Y, best for), decide (which should I pick, is it worth it), learn (how to, what is).',
    input.location ? '- Include the location naturally in some questions.' : '',
    '- No numbering, no commentary.',
    '',
    'Reply with only a JSON array of objects: [{"question": "...", "intent": "discover|compare|decide|learn"}]',
  ];
  return lines.filter(Boolean).join('\n');
}

export async function suggestPrompts(input: {
  url: string | null;
  description: string | null;
  location: string | null;
  lane: SuggestionLane;
}): Promise<PromptSuggestion[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
  let domain: string | null = null;
  if (input.url) {
    try {
      domain = new URL(/^https?:\/\//i.test(input.url) ? input.url : `https://${input.url}`).hostname.replace(/^www\./, '');
    } catch {
      domain = null;
    }
  }
  const client = new GoogleGenerativeAI(apiKey);
  // Only look the site up when there's nothing else to go on. Google fetches
  // the page through grounding, so our server never requests user URLs.
  const grounded = !!domain && !input.description;
  const model: GenerativeModel = client.getGenerativeModel({
    model: MODEL,
    ...(grounded ? { tools: [{ googleSearch: {} }] as unknown as Tool[] } : {}),
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: buildPrompt({ domain, description: input.description, location: input.location, lane: input.lane }) }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      ...(grounded ? {} : { responseMimeType: 'application/json' }),
    },
  });
  return parseSuggestions(result.response.text());
}
