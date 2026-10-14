// services/sharedPlatforms.ts — sites where many businesses live under one domain.
//
// Grounding sources only tell us the cited site's DOMAIN, not the page path
// (the URL Gemini returns is a Google redirect). On a shared platform a domain
// match says nothing about whose page it was: someone whose "website" is
// facebook.com/theirbakery would be told they were cited whenever ANY
// facebook.com page was. So on these domains we do not claim a match.
//
// Only platforms where a business's identity is in the PATH belong here.
// Per-business subdomains (acme.myshopify.com, acme.github.io) are not shared:
// the subdomain itself identifies the business.
const SHARED_PLATFORMS = [
  // social
  'facebook.com', 'fb.com', 'instagram.com', 'linkedin.com', 'x.com', 'twitter.com',
  'youtube.com', 'youtu.be', 'tiktok.com', 'pinterest.com', 'reddit.com', 'nextdoor.com', 'linktr.ee',
  // reviews and directories
  'yelp.com', 'tripadvisor.com', 'bbb.org', 'yellowpages.com', 'angi.com', 'thumbtack.com',
  'houzz.com', 'homeadvisor.com', 'trustpilot.com', 'g2.com', 'capterra.com', 'clutch.co',
  'healthgrades.com', 'zocdoc.com', 'avvo.com', 'zillow.com', 'realtor.com', 'airbnb.com', 'booking.com',
  // marketplaces
  'etsy.com', 'amazon.com', 'ebay.com', 'upwork.com', 'fiverr.com',
  // code and reference
  'github.com', 'gitlab.com', 'wikipedia.org', 'crunchbase.com', 'producthunt.com', 'behance.net', 'dribbble.com',
  // google (maps, business profiles, sites.google.com)
  'google.com', 'g.page',
];

export function isSharedPlatform(domain: string | null | undefined): boolean {
  if (!domain) return false;
  const d = domain.toLowerCase().replace(/^www\./, '');
  return SHARED_PLATFORMS.some(root => d === root || d.endsWith(`.${root}`));
}

// The domain to match cited sources against, or null when a match would not
// mean anything (no site given, or the site is a page on a shared platform).
export function matchableDomain(userDomain: string | null): string | null {
  return userDomain && !isSharedPlatform(userDomain) ? userDomain : null;
}
