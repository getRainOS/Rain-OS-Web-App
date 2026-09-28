import { describe, it, expect } from 'vitest';
import { brandInText } from '../services/brandMatch';

describe('brandInText', () => {
  it('matches a plain exact mention', () => {
    expect(brandInText('Acme', 'Acme is a great company.')).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(brandInText('acme', 'ACME is a great company.')).toBe(true);
    expect(brandInText('ACME', 'acme is a great company.')).toBe(true);
  });

  it('matches "Wal Mart" against "Walmart"', () => {
    expect(brandInText('Wal Mart', 'I shop at Walmart every week.')).toBe(true);
  });

  it('matches "Wal Mart" against "wal-mart"', () => {
    expect(brandInText('Wal Mart', 'I shop at wal-mart every week.')).toBe(true);
  });

  it('requires a whole-word match ("Apple" does not match inside "pineapple")', () => {
    expect(brandInText('Apple', 'I love pineapple juice.')).toBe(false);
  });

  it('still matches "Apple" as its own word', () => {
    expect(brandInText('Apple', 'Apple released a new phone today.')).toBe(true);
  });

  it('returns false for a plain no-match', () => {
    expect(brandInText('Acme', 'This text never mentions the brand at all.')).toBe(false);
  });

  it('returns false for empty brand or text', () => {
    expect(brandInText('', 'some text')).toBe(false);
    expect(brandInText('Acme', '')).toBe(false);
  });

  it('returns false for a whitespace-only brand, without throwing', () => {
    expect(() => brandInText('   ', 'some text')).not.toThrow();
    expect(brandInText('   ', 'some text')).toBe(false);
  });

  it('handles brand names with regex special characters without throwing', () => {
    expect(() => brandInText('AT&T', 'text')).not.toThrow();
    expect(() => brandInText('C++', 'text')).not.toThrow();
    expect(() => brandInText('Rain.OS', 'text')).not.toThrow();
  });

  it('matches "AT&T" against literal "AT&T" text, treating "&" as optional punctuation', () => {
    expect(brandInText('AT&T', 'AT&T reported strong earnings today.')).toBe(true);
  });

  it('matches "C++" against literal "C++" text but not an unrelated word', () => {
    expect(brandInText('C++', 'We use C++ for performance-critical code.')).toBe(true);
    expect(brandInText('C++', 'The cats are cute.')).toBe(false);
  });

  it('matches "Rain.OS" against "Rain.OS", "RainOS", and "Rain OS"', () => {
    expect(brandInText('Rain.OS', 'We built Rain.OS for founders.')).toBe(true);
    expect(brandInText('Rain.OS', 'We built RainOS for founders.')).toBe(true);
    expect(brandInText('Rain.OS', 'We built Rain OS for founders.')).toBe(true);
  });

  it('matches a possessive form ("Walmart\'s" matches "Walmart")', () => {
    expect(brandInText('Walmart', "Walmart's prices are low.")).toBe(true);
  });
});
