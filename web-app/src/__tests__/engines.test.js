import { describe, it, expect } from 'vitest';
import { engineName, enginesOf } from '../lib/engines.js';

describe('engineName', () => {
  it('maps saved engine ids to display names', () => {
    expect(engineName('ai_overviews')).toBe('Google AI Overviews');
  });
  it('falls back to Gemini for unknown ids', () => {
    expect(engineName('unknown')).toBe('Gemini');
  });
});

describe('enginesOf', () => {
  it('says AI when there are no checks', () => {
    expect(enginesOf([])).toBe('AI');
  });
  it('names one engine without a conjunction', () => {
    expect(enginesOf([{ engine: 'chatgpt' }, { engine: 'chatgpt' }])).toBe('ChatGPT');
  });
  it('joins several engines with commas and "and"', () => {
    expect(enginesOf([{ engine: 'gemini' }, { engine: 'chatgpt' }, { engine: 'perplexity' }]))
      .toBe('Gemini, ChatGPT and Perplexity');
  });
  it('treats a check with no engine as Gemini', () => {
    expect(enginesOf([{}])).toBe('Gemini');
  });
});
