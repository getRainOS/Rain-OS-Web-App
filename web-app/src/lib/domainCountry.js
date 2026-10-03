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

// ccTLD → { name, flag, iso } for TLDs that do carry a genuine geographic
// signal. `iso` is the ISO 3166-1 numeric code as used by world-atlas's
// topojson `id` field, so a region can be matched straight to a map
// geometry with no separate lookup table.
const TLD_COUNTRY = {
  us: { name: 'United States', flag: '🇺🇸', iso: '840' },
  uk: { name: 'United Kingdom', flag: '🇬🇧', iso: '826' },
  de: { name: 'Germany', flag: '🇩🇪', iso: '276' },
  fr: { name: 'France', flag: '🇫🇷', iso: '250' },
  es: { name: 'Spain', flag: '🇪🇸', iso: '724' },
  it: { name: 'Italy', flag: '🇮🇹', iso: '380' },
  nl: { name: 'Netherlands', flag: '🇳🇱', iso: '528' },
  be: { name: 'Belgium', flag: '🇧🇪', iso: '056' },
  ch: { name: 'Switzerland', flag: '🇨🇭', iso: '756' },
  at: { name: 'Austria', flag: '🇦🇹', iso: '040' },
  se: { name: 'Sweden', flag: '🇸🇪', iso: '752' },
  no: { name: 'Norway', flag: '🇳🇴', iso: '578' },
  dk: { name: 'Denmark', flag: '🇩🇰', iso: '208' },
  fi: { name: 'Finland', flag: '🇫🇮', iso: '246' },
  pl: { name: 'Poland', flag: '🇵🇱', iso: '616' },
  pt: { name: 'Portugal', flag: '🇵🇹', iso: '620' },
  ie: { name: 'Ireland', flag: '🇮🇪', iso: '372' },
  gr: { name: 'Greece', flag: '🇬🇷', iso: '300' },
  cz: { name: 'Czechia', flag: '🇨🇿', iso: '203' },
  ro: { name: 'Romania', flag: '🇷🇴', iso: '642' },
  ca: { name: 'Canada', flag: '🇨🇦', iso: '124' },
  mx: { name: 'Mexico', flag: '🇲🇽', iso: '484' },
  br: { name: 'Brazil', flag: '🇧🇷', iso: '076' },
  ar: { name: 'Argentina', flag: '🇦🇷', iso: '032' },
  cl: { name: 'Chile', flag: '🇨🇱', iso: '152' },
  jp: { name: 'Japan', flag: '🇯🇵', iso: '392' },
  cn: { name: 'China', flag: '🇨🇳', iso: '156' },
  kr: { name: 'South Korea', flag: '🇰🇷', iso: '410' },
  in: { name: 'India', flag: '🇮🇳', iso: '356' },
  sg: { name: 'Singapore', flag: '🇸🇬', iso: '702' },
  hk: { name: 'Hong Kong', flag: '🇭🇰', iso: '344' },
  tw: { name: 'Taiwan', flag: '🇹🇼', iso: '158' },
  id: { name: 'Indonesia', flag: '🇮🇩', iso: '360' },
  th: { name: 'Thailand', flag: '🇹🇭', iso: '764' },
  vn: { name: 'Vietnam', flag: '🇻🇳', iso: '704' },
  ph: { name: 'Philippines', flag: '🇵🇭', iso: '608' },
  my: { name: 'Malaysia', flag: '🇲🇾', iso: '458' },
  au: { name: 'Australia', flag: '🇦🇺', iso: '036' },
  nz: { name: 'New Zealand', flag: '🇳🇿', iso: '554' },
  za: { name: 'South Africa', flag: '🇿🇦', iso: '710' },
  ng: { name: 'Nigeria', flag: '🇳🇬', iso: '566' },
  eg: { name: 'Egypt', flag: '🇪🇬', iso: '818' },
  ae: { name: 'United Arab Emirates', flag: '🇦🇪', iso: '784' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦', iso: '682' },
  il: { name: 'Israel', flag: '🇮🇱', iso: '376' },
  tr: { name: 'Turkey', flag: '🇹🇷', iso: '792' },
  ru: { name: 'Russia', flag: '🇷🇺', iso: '643' },
  ua: { name: 'Ukraine', flag: '🇺🇦', iso: '804' },
};

/**
 * Returns { name, flag, iso } for a domain whose TLD carries a genuine
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
