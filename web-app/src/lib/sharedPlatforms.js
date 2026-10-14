// Sites where many businesses live under one domain. Keep in sync with
// backend/services/sharedPlatforms.ts. Grounding sources only carry the cited
// site's domain, so on these a domain match cannot show whose page it was.
const SHARED_PLATFORMS = [
  'facebook.com',
  'fb.com',
  'instagram.com',
  'linkedin.com',
  'x.com',
  'twitter.com',
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'pinterest.com',
  'reddit.com',
  'nextdoor.com',
  'linktr.ee',
  'yelp.com',
  'tripadvisor.com',
  'bbb.org',
  'yellowpages.com',
  'angi.com',
  'thumbtack.com',
  'houzz.com',
  'homeadvisor.com',
  'trustpilot.com',
  'g2.com',
  'capterra.com',
  'clutch.co',
  'healthgrades.com',
  'zocdoc.com',
  'avvo.com',
  'zillow.com',
  'realtor.com',
  'airbnb.com',
  'booking.com',
  'etsy.com',
  'amazon.com',
  'ebay.com',
  'upwork.com',
  'fiverr.com',
  'github.com',
  'gitlab.com',
  'wikipedia.org',
  'crunchbase.com',
  'producthunt.com',
  'behance.net',
  'dribbble.com',
  'google.com',
  'g.page',
];

export function isSharedPlatform(domain) {
  if (!domain) return false;
  const d = String(domain).toLowerCase().replace(/^www\./, '');
  return SHARED_PLATFORMS.some(root => d === root || d.endsWith(`.${root}`));
}
