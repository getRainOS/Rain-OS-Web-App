import { describe, it, expect } from 'vitest';
import { availableEngines, engineLabel } from '../services/engines';

describe('engines', () => {
  it('only lists engines that are implemented and have a key', () => {
    expect(availableEngines({ GEMINI_API_KEY: 'x', OPENAI_API_KEY: 'y' } as any).map(e => e.id)).toEqual(['gemini']);
    expect(availableEngines({ GEMINI_API_KEY: 'x', CLORO_API_KEY: 'y' } as any).map(e => e.id)).toEqual(['gemini', 'chatgpt']);
    expect(availableEngines({} as any)).toEqual([]);
  });
  it('labels unknown or missing engines as Gemini', () => {
    expect(engineLabel('chatgpt')).toBe('ChatGPT');
    expect(engineLabel(undefined)).toBe('Gemini with Google Search');
  });
});
