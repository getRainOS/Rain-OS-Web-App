import { describe, it, expect } from 'vitest';
import { parseOptions, parseTopicQuestions, buildOptionsPrompt, buildQuestionsPrompt, MAX_OPTIONS, MAX_QUESTIONS } from '../services/topicService';

describe('parseOptions', () => {
  it('reads strings, tidies them and drops duplicates', () => {
    expect(parseOptions('["Vibe coding"," vibe coding ","Dev tools","x"]')).toEqual(['Vibe coding', 'Dev tools']);
  });
  it('accepts objects with a label, caps the count and survives bad input', () => {
    const many = JSON.stringify(Array.from({ length: 20 }, (_, i) => ({ label: `Option ${i}` })));
    expect(parseOptions(many)).toHaveLength(MAX_OPTIONS);
    expect(parseOptions('nope')).toEqual([]);
  });
});

describe('parseTopicQuestions', () => {
  it('keeps the intent when valid and defaults to learn', () => {
    const out = parseTopicQuestions('[{"question":"is vibe coding safe for a startup","intent":"decide"},{"question":"what is vibe coding exactly"}]');
    expect(out.map(q => q.intent)).toEqual(['decide', 'learn']);
  });
  it('caps the count and drops short or duplicate questions', () => {
    const many = JSON.stringify(Array.from({ length: 30 }, (_, i) => ({ question: `Question number ${i} about it` })));
    expect(parseTopicQuestions(many)).toHaveLength(MAX_QUESTIONS);
    expect(parseTopicQuestions('[{"question":"hi"},{"question":"A real question here"},{"question":"a real question here"}]')).toHaveLength(1);
  });
});

describe('prompts', () => {
  it('asks for fields first, niches second, angles third', () => {
    expect(buildOptionsPrompt({ level: 'field', path: [], lane: 'general', site: null, known: [] })).toContain('industries or fields');
    expect(buildOptionsPrompt({ level: 'niche', path: ['Software'], lane: 'general', site: null, known: [] })).toContain('niches within "Software"');
    expect(buildOptionsPrompt({ level: 'angle', path: ['Software', 'Vibe coding'], lane: 'general', site: null, known: [] })).toContain('audiences and angles');
  });
  it('uses what the user already wrote', () => {
    expect(buildOptionsPrompt({ level: 'field', path: [], lane: 'general', site: 'acme.com', known: ['Coding Above Weight Class'] })).toContain('Coding Above Weight Class');
  });
  it('builds the questions prompt from the whole path', () => {
    expect(buildQuestionsPrompt({ path: ['Software', 'Vibe coding'], lane: 'general', kind: 'blog' })).toContain('Software > Vibe coding');
  });
});
