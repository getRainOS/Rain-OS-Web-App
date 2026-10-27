// Groups cited domains into the kinds of sites AI leans on, so a check says
// where to show up next (a Reddit thread, a review profile, a press mention)
// instead of only which domains won.

const TYPES = [
  {
    id: 'forums', label: 'Forums & communities',
    action: 'Answer the question in these threads honestly, as yourself. AI quotes real discussions.',
    domains: ['reddit.com', 'quora.com', 'stackoverflow.com', 'stackexchange.com', 'news.ycombinator.com', 'discord.com', 'dev.to', 'indiehackers.com', 'nextdoor.com'],
    hosts: [/^(community|forum|forums|discuss)\./],
  },
  {
    id: 'reviews', label: 'Review & directory sites',
    action: 'Claim your profile on these sites and ask happy customers for reviews there.',
    domains: ['g2.com', 'capterra.com', 'trustpilot.com', 'yelp.com', 'tripadvisor.com', 'bbb.org', 'getapp.com', 'softwareadvice.com', 'angi.com', 'homeadvisor.com', 'thumbtack.com', 'clutch.co', 'producthunt.com', 'yellowpages.com', 'houzz.com', 'alternativeto.net', 'trustradius.com', 'sitejabber.com', 'consumerreports.org', 'zocdoc.com', 'healthgrades.com', 'vitals.com', 'avvo.com', 'findlaw.com', 'justia.com', 'opentable.com', 'mapquest.com', 'superpages.com', 'manta.com'],
  },
  {
    id: 'news', label: 'News & media',
    action: 'Pitch a story or expert quote to the outlets covering this topic.',
    domains: ['nytimes.com', 'forbes.com', 'techcrunch.com', 'bbc.com', 'bbc.co.uk', 'cnn.com', 'theverge.com', 'wired.com', 'businessinsider.com', 'reuters.com', 'apnews.com', 'wsj.com', 'theguardian.com', 'cnbc.com', 'usatoday.com', 'zdnet.com', 'pcmag.com', 'techradar.com', 'cnet.com', 'engadget.com', 'mashable.com', 'fastcompany.com', 'inc.com', 'entrepreneur.com', 'axios.com', 'bloomberg.com', 'washingtonpost.com', 'npr.org', 'tomsguide.com', 'nerdwallet.com'],
  },
  {
    id: 'reference', label: 'Reference & education',
    action: 'Make sure facts about you are correct here, and cite your own data so references can link to it.',
    domains: ['wikipedia.org', 'wikihow.com', 'britannica.com', 'investopedia.com', 'merriam-webster.com', 'healthline.com', 'mayoclinic.org', 'webmd.com'],
    suffixes: ['.gov', '.edu', '.gov.uk', '.ac.uk'],
  },
  {
    id: 'video', label: 'Video',
    action: 'A short video answering this exact question gives AI a source to cite.',
    domains: ['youtube.com', 'youtu.be', 'vimeo.com', 'tiktok.com'],
  },
  {
    id: 'social', label: 'Social & blogging platforms',
    action: 'Post a clear, useful answer to this question on the platforms AI is reading.',
    domains: ['linkedin.com', 'facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'medium.com', 'substack.com', 'pinterest.com', 'threads.net', 'wordpress.com', 'blogspot.com', 'tumblr.com'],
  },
  {
    id: 'shopping', label: 'Marketplaces',
    action: 'Keep your listings on these marketplaces complete: title, specs, photos and reviews.',
    domains: ['amazon.com', 'ebay.com', 'etsy.com', 'walmart.com', 'target.com', 'bestbuy.com', 'shopify.com', 'aliexpress.com', 'homedepot.com', 'lowes.com'],
  },
];

const OTHER = {
  id: 'websites', label: 'Company websites & blogs',
  action: 'Publish a page that answers this question directly, with a clear heading and a short answer up top.',
};

function matches(domain, type) {
  if (type.domains?.some(d => domain === d || domain.endsWith(`.${d}`))) return true;
  if (type.suffixes?.some(s => domain.endsWith(s))) return true;
  if (type.hosts?.some(re => re.test(domain))) return true;
  return false;
}

export function sourceTypeOf(domain) {
  const d = (domain || '').toLowerCase().replace(/^www\./, '');
  return TYPES.find(t => matches(d, t)) || OTHER;
}

// domains: [{ domain, queryCount, avgRank, sampleUrl }] (competitors only).
// Returns types sorted by how many citations they earned, each with its
// share of all citations and its top domains.
export function buildSourceTypes(domains, ownPoint) {
  const groups = new Map();
  let total = 0;
  for (const d of domains) {
    const type = sourceTypeOf(d.domain);
    let g = groups.get(type.id);
    if (!g) {
      g = { id: type.id, label: type.label, action: type.action, citations: 0, domains: [] };
      groups.set(type.id, g);
    }
    g.citations += d.queryCount;
    g.domains.push(d);
    total += d.queryCount;
  }
  const ownCitations = ownPoint?.queryCount || 0;
  total += ownCitations;
  const types = [...groups.values()]
    .map(g => ({
      ...g,
      share: total ? g.citations / total : 0,
      domains: g.domains.sort((a, b) => b.queryCount - a.queryCount || a.avgRank - b.avgRank),
    }))
    .sort((a, b) => b.citations - a.citations);
  return { total, ownCitations, ownShare: total ? ownCitations / total : 0, types };
}
