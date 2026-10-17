import { describe, it, expect } from 'vitest';
import { parseQuestions, parseDraft, buildDraftPrompt, MAX_QUESTIONS } from '../services/interviewService';

describe('interview', () => {
  it('reads questions, drops short and duplicate ones, caps the count', () => {
    expect(parseQuestions('["What did you try first and why?","what did you try first and why?","Why?"]')).toEqual(['What did you try first and why?']);
    const many = JSON.stringify(Array.from({ length: 9 }, (_, i) => `Interview question number ${i}?`));
    expect(parseQuestions(many)).toHaveLength(MAX_QUESTIONS);
    expect(parseQuestions('nope')).toEqual([]);
  });
  it('accepts a full draft and rejects a stub', () => {
    const draft = 'x'.repeat(250);
    expect(parseDraft(JSON.stringify({ title: 'T', draft }))).toEqual({ title: 'T', draft });
    expect(parseDraft(JSON.stringify({ title: 'T', draft: 'short' }))).toBeNull();
  });
  it('tells the model to use only the answers and puts them in the prompt', () => {
    const p = buildDraftPrompt('how to price a bakery cake', [{ question: 'What do you charge?', answer: '$4 per slice' }], 'blog');
    expect(p).toContain('Use ONLY the facts');
    expect(p).toContain('$4 per slice');
  });
});
