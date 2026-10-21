// Which engine a Share of Voice or Brand Sentiment request asked for, and
// from where. Gemini when none is given; otherwise it must be switched on.
import { availableEngines } from './index';
import { normaliseLocation, type CheckLocation } from './location';

export function requestedEngine(
  body: any,
  user: { locationState?: string | null }
): { engine: string; location: CheckLocation } | { error: string } {
  const engine = typeof body?.engine === 'string' && body.engine ? body.engine : 'gemini';
  if (!availableEngines().some(e => e.id === engine)) return { error: 'That AI engine is not available.' };
  return { engine, location: normaliseLocation(body?.country, body?.state, user.locationState ?? null) };
}
