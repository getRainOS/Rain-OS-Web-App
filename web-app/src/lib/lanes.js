// Single source of truth for lane id/label/description copy, shared by
// Dashboard's LaneSelector cards and Settings' Solution Lane picker.
// Previously these were two separately hand-maintained lists that drifted:
// Settings' copy fell out of date (stale weight percentages that no longer
// matched geminiService.ts) and was missing the vibe_coders lane entirely —
// a user literally could not switch into that lane from Settings.
export const LANES = [
  { id: 'general', label: 'Writers & Marketers', desc: 'Blog posts, newsletters, and landing pages — written content built to get cited by AI, not just ranked.' },
  { id: 'product_sellers', label: 'Product Sellers', desc: 'For Shopify, Wix, Etsy, Amazon listings, and online stores — get your products found by AI shopping assistants.' },
  { id: 'vibe_coders', label: 'Vibe Coders', desc: "Built with Bolt, Lovable, Replit, v0, or similar? Audit your app's content, repo, and discoverability before launch." },
  { id: 'developers', label: 'Developers', desc: 'Technical docs, READMEs, and API references on GitHub or your docs site, scored for AI readability.' },
  { id: 'local_business', label: 'Local Service Business', desc: "For local service businesses — on Wix, Squarespace, WordPress, or your own site — get found when customers ask AI who's nearby." },
];
