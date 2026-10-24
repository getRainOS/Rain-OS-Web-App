import { describe, it, expect } from 'vitest';
import { pageBrandName } from '../services/pageBrand';

describe('pageBrandName', () => {
  it('prefers the site name the page declares', () => {
    expect(pageBrandName('<meta property="og:site_name" content="Bright Smile Dental"><title>Invisalign | BSD</title>')).toBe('Bright Smile Dental');
  });
  it('uses the business name in structured data', () => {
    const html = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Dentist","name":"Bright Smile Dental"}</script>';
    expect(pageBrandName(html)).toBe('Bright Smile Dental');
  });
  it('takes the part of the title that matches the site', () => {
    expect(pageBrandName('<title>Invisalign in Austin | Bright Smile Dental</title>', 'https://brightsmiledental.com/invisalign')).toBe('Bright Smile Dental');
    expect(pageBrandName('<title>Longreads — Eating Alone</title>', 'https://longreads.com/x')).toBe('Longreads');
  });
  it('returns null when there is nothing clear', () => {
    expect(pageBrandName('<title>Home</title>')).toBeNull();
  });
});
