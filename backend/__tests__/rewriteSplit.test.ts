import { describe, it, expect } from 'vitest';
import { splitForRewrite } from '../services/geminiService';

describe('splitForRewrite', () => {
  it('keeps short content in one part', () => {
    expect(splitForRewrite('One paragraph.\n\nTwo paragraph.', 7000)).toEqual(['One paragraph.\n\nTwo paragraph.']);
  });

  it('splits long content on paragraph breaks without losing text', () => {
    const paras = Array.from({ length: 12 }, (_, i) => `Paragraph ${i} ` + 'word '.repeat(150));
    const text = paras.join('\n\n');
    const parts = splitForRewrite(text, 2000);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every(p => p.length <= 2000)).toBe(true);
    const norm = (t: string) => t.replace(/\s+/g, ' ').trim();
    expect(norm(parts.join(' '))).toBe(norm(text));
  });

  it('cuts one oversized paragraph on sentence boundaries', () => {
    const text = 'This is a sentence. '.repeat(400);
    const parts = splitForRewrite(text, 1000);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every(p => p.length <= 1000)).toBe(true);
  });
});
