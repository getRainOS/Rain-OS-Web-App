// services/brandMatch.ts
//
// Shared fuzzy brand-name text matcher, used by Brand Sentiment and Share of
// Voice to decide whether an LLM's answer text mentions the user's brand.
//
// This is deliberately separate from domain/citation matching (comparing a
// grounding source's domain against the user's URL, Citation-Monitor-style):
// that is exact/subdomain matching against a URL, not fuzzy text matching
// against free-form prose, and the two should never be conflated.

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBrandPattern(brand: string): RegExp | null {
  const tokens = brand
    .trim()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(escapeRegex);
  if (tokens.length === 0) return null;
  const pattern = tokens.join('[^a-z0-9]*');
  return new RegExp(`\\b${pattern}\\b`, 'i');
}

// Case-insensitive; spaces, hyphens, and other punctuation between tokens
// are optional (so "Wal Mart" matches "Walmart" and "wal-mart", and "AT&T"
// matches "AT&T"); requires a whole-word match (so "Apple" does not match
// inside "pineapple").
export function brandInText(brand: string, text: string): boolean {
  if (!brand || !text) return false;
  const pattern = buildBrandPattern(brand);
  return pattern ? pattern.test(text) : false;
}
