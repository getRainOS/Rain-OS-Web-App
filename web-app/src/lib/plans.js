// Single source of truth for Stripe price IDs and their plan names —
// previously duplicated as separate literal maps in Layout.jsx, Settings.jsx,
// and re-derived from Upgrade.jsx's PLANS catalog.
export const PRICE_IDS = {
  FREE: 'price_1SeCHg3NMjs4uYdguOgkr3SQ',
  PRO: 'price_1SeCJH3NMjs4uYdgpi0xB0XN',
  BUSINESS: 'price_1SeCKM3NMjs4uYdgcBRhgIhD',
};

export const PRICE_TO_PLAN = {
  [PRICE_IDS.PRO]: 'Pro',
  [PRICE_IDS.BUSINESS]: 'Business',
  [PRICE_IDS.FREE]: 'Free',
};
