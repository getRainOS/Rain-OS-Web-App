// For local businesses: turn the sites an AI cited for a local question into
// a to-do list. Directory and review sites are places to claim or fix a
// profile; other third-party pages (local news, "best of" lists, blogs) are
// places to ask to be featured. The business's own site is left out.
import { domainOf } from './opportunities.js';

const DIRECTORIES = {
  'google.com': 'Google Business Profile',
  'g.page': 'Google Business Profile',
  'yelp.com': 'Yelp',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'nextdoor.com': 'Nextdoor',
  'bbb.org': 'Better Business Bureau',
  'yellowpages.com': 'Yellow Pages',
  'angi.com': 'Angi',
  'thumbtack.com': 'Thumbtack',
  'houzz.com': 'Houzz',
  'homeadvisor.com': 'HomeAdvisor',
  'tripadvisor.com': 'Tripadvisor',
  'trustpilot.com': 'Trustpilot',
  'healthgrades.com': 'Healthgrades',
  'zocdoc.com': 'Zocdoc',
  'avvo.com': 'Avvo',
  'zillow.com': 'Zillow',
  'realtor.com': 'Realtor.com',
};

function directoryName(domain) {
  const hit = Object.keys(DIRECTORIES).find(root => domain === root || domain.endsWith(`.${root}`));
  return hit ? DIRECTORIES[hit] : null;
}

const sameSite = (a, b) => !!a && !!b && (a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`));

export function localListingTasks(sources, ownUrl) {
  const own = domainOf(ownUrl);
  const profiles = new Map();
  const features = new Map();
  for (const s of sources || []) {
    const domain = domainOf(s.domain || s.uri || s.url);
    if (!domain || sameSite(domain, own)) continue;
    const name = directoryName(domain);
    if (name) {
      if (!profiles.has(name)) profiles.set(name, { name, domain });
    } else if (!features.has(domain)) {
      features.set(domain, { domain, title: s.title && s.title !== domain ? s.title : null, url: s.uri || s.url || null });
    }
  }
  return { profiles: [...profiles.values()], features: [...features.values()] };
}

// "near me" questions are answered from the asker's location, which our
// checks don't have, so ask for the city instead.
export function needsPlace(question) {
  const q = String(question || '').toLowerCase();
  return /\b(near me|nearby|close to me|around me|in my area)\b/.test(q) && !/\b(in|near) [a-z]/.test(q.replace(/\b(near me|in my area)\b/g, ''));
}
