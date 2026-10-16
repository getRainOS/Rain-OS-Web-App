import { describe, it, expect } from 'vitest';
import { parseIdeas, buildIdeasPrompt, MAX_IDEAS } from '../services/contentIdeasService';

describe('parseIdeas', () => {
  it('reads a JSON list and normalizes fields', () => {
    const out = parseIdeas('[{"title":" How to price a wedding cake ","angle":"A simple formula.","question":"how much should a wedding cake cost","format":"Article"}]');
    expect(out).toEqual([{ title: 'How to price a wedding cake', angle: 'A simple formula.', question: 'how much should a wedding cake cost', format: 'article' }]);
  });
  it('defaults the format to blog and drops duplicates and tiny titles', () => {
    const out = parseIdeas('[{"title":"Same title here"},{"title":"same title here"},{"title":"Hi"}]');
    expect(out).toHaveLength(1);
    expect(out[0].format).toBe('blog');
  });
  it('tolerates prose around the JSON and bad input', () => {
    expect(parseIdeas('Sure! [{"title":"A decent title"}] hope that helps')).toHaveLength(1);
    expect(parseIdeas('not json')).toEqual([]);
    expect(parseIdeas('[1,2,3]')).toEqual([]);
  });
  it('caps the number of ideas', () => {
    const many = JSON.stringify(Array.from({ length: 30 }, (_, i) => ({ title: `Idea number ${i} here` })));
    expect(parseIdeas(many)).toHaveLength(MAX_IDEAS);
  });
});

describe('buildIdeasPrompt', () => {
  it('asks for follow-ups when the writer supplies a piece', () => {
    const p = buildIdeasPrompt({ topic: null, writing: 'My post text', kind: 'blog', audience: null });
    expect(p).toContain('My post text');
    expect(p).toContain('NEW pieces');
    expect(p).toContain('blog post');
  });
});
