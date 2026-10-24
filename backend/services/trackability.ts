// services/trackability.ts — whether a question can be tracked weekly. Kept
// free of database imports so it can be used and tested on its own.
import { extractDomain } from './citationCheckService';
import { matchableDomain } from './sharedPlatforms';

// True when the URL points at a site we can match cited sources against.
export function hasMatchableSite(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return !!matchableDomain(extractDomain(url));
  } catch {
    return false;
  }
}

export const NO_SITE_MESSAGE =
  'Add a brand name or your own website to track this question. Social or review pages are shared with other businesses, so they can\'t be matched as yours.';

// Trackable with a matchable website (cited) or a brand name (mentioned).
export const canTrack = (url: string | null | undefined, brand: string | null | undefined): boolean => hasMatchableSite(url) || !!(brand && brand.trim());
