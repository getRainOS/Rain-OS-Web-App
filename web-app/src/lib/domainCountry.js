// Infers a likely country from a domain's TLD, for a lightweight "which
// regions are your competitors' citations coming from" view. This is a
// heuristic, not a measurement — many domains carry no reliable geographic
// signal at all, and we deliberately return null for those rather than
// guess, so the UI can say "unknown" instead of showing a fabricated
// country.
//
// Country-code TLDs that are overwhelmingly used as generic/brandable
// domains in practice (not as a real "this site is based in X" signal) are
// deliberately excluded, even though they are technically real ccTLDs —
// including them would misattribute e.g. a .ai SaaS product to Anguilla.
const GENERIC_USE_TLDS = new Set([
  'io', 'ai', 'co', 'me', 'tv', 'cc', 'ly', 'sh', 'to', 'fm', 'am', 'is',
  'gg', 'st', 'so', 'gl', 'app', 'dev', 'xyz', 'sc',
]);

// ccTLD → { name, flag } for TLDs that do carry a genuine geographic signal.
const TLD_COUNTRY = {
  us: { name: 'United States', flag: '🇺🇸' },
  uk: { name: 'United Kingdom', flag: '🇬🇧' },
  de: { name: 'Germany', flag: '🇩🇪' },
  fr: { name: 'France', flag: '🇫🇷' },
  es: { name: 'Spain', flag: '🇪🇸' },
  it: { name: 'Italy', flag: '🇮🇹' },
  nl: { name: 'Netherlands', flag: '🇳🇱' },
  be: { name: 'Belgium', flag: '🇧🇪' },
  ch: { name: 'Switzerland', flag: '🇨🇭' },
  at: { name: 'Austria', flag: '🇦🇹' },
  se: { name: 'Sweden', flag: '🇸🇪' },
  no: { name: 'Norway', flag: '🇳🇴' },
  dk: { name: 'Denmark', flag: '🇩🇰' },
  fi: { name: 'Finland', flag: '🇫🇮' },
  pl: { name: 'Poland', flag: '🇵🇱' },
  pt: { name: 'Portugal', flag: '🇵🇹' },
  ie: { name: 'Ireland', flag: '🇮🇪' },
  gr: { name: 'Greece', flag: '🇬🇷' },
  cz: { name: 'Czechia', flag: '🇨🇿' },
  ro: { name: 'Romania', flag: '🇷🇴' },
  ca: { name: 'Canada', flag: '🇨🇦' },
  mx: { name: 'Mexico', flag: '🇲🇽' },
  br: { name: 'Brazil', flag: '🇧🇷' },
  ar: { name: 'Argentina', flag: '🇦🇷' },
  cl: { name: 'Chile', flag: '🇨🇱' },
  jp: { name: 'Japan', flag: '🇯🇵' },
  cn: { name: 'China', flag: '🇨🇳' },
  kr: { name: 'South Korea', flag: '🇰🇷' },
  in: { name: 'India', flag: '🇮🇳' },
  sg: { name: 'Singapore', flag: '🇸🇬' },
  hk: { name: 'Hong Kong', flag: '🇭🇰' },
  tw: { name: 'Taiwan', flag: '🇹🇼' },
  id: { name: 'Indonesia', flag: '🇮🇩' },
  th: { name: 'Thailand', flag: '🇹🇭' },
  vn: { name: 'Vietnam', flag: '🇻🇳' },
  ph: { name: 'Philippines', flag: '🇵🇭' },
  my: { name: 'Malaysia', flag: '🇲🇾' },
  au: { name: 'Australia', flag: '🇦🇺' },
  nz: { name: 'New Zealand', flag: '🇳🇿' },
  za: { name: 'South Africa', flag: '🇿🇦' },
  ng: { name: 'Nigeria', flag: '🇳🇬' },
  eg: { name: 'Egypt', flag: '🇪🇬' },
  ae: { name: 'United Arab Emirates', flag: '🇦🇪' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦' },
  il: { name: 'Israel', flag: '🇮🇱' },
  tr: { name: 'Turkey', flag: '🇹🇷' },
  ru: { name: 'Russia', flag: '🇷🇺' },
  ua: { name: 'Ukraine', flag: '🇺🇦' },
};

/**
 * Returns { name, flag } for a domain whose TLD carries a genuine
 * geographic signal, or null when the TLD is generic/ambiguous or
 * unrecognized. Never guesses.
 */
export function inferCountry(domain) {
  if (!domain) return null;
  const parts = domain.toLowerCase().split('.');
  const tld = parts[parts.length - 1];
  if (!tld || GENERIC_USE_TLDS.has(tld)) return null;
  return TLD_COUNTRY[tld] || null;
}
