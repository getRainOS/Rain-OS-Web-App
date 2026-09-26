// services/groundingSources.ts — Shared helper for resolving a grounding
// chunk's real cited domain.
//
// Gemini's `googleSearch` grounding tool returns each source as a chunk with
// `web.uri` and `web.title`. For this tool, `web.uri` is typically Google's
// own grounding redirect proxy (vertexaisearch.cloud.google.com/...), not
// the cited site's real URL — so parsing its hostname yields a useless,
// Google-owned domain instead of the actual source. `web.title`, on the
// other hand, normally carries the real source name/domain directly.
//
// This resolves the domain by preferring `title` (when it looks like a bare
// domain) and only falling back to parsing `uri`'s hostname when `title` is
// missing or doesn't look like a domain.

const DOMAIN_SHAPE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

/** True if `s` looks like a bare domain: dot-separated labels, no spaces, plausible TLD. */
export function looksLikeDomain(s: string): boolean {
  const trimmed = s.trim().toLowerCase();
  if (!trimmed || trimmed.includes(' ')) return false;
  if (!DOMAIN_SHAPE.test(trimmed)) return false;
  const labels = trimmed.split('.');
  const tld = labels[labels.length - 1];
  return tld.length >= 2 && /^[a-z]+$/.test(tld);
}

function hostnameFromUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

/**
 * Resolve a grounding chunk's real cited domain. Prefers `title` when it
 * looks like a bare domain; falls back to parsing `rawUrl`'s hostname only
 * when `title` is missing or not domain-shaped.
 */
export function resolveSourceDomain(title: string | undefined, rawUrl: string): string {
  const candidate = (title || '').trim().toLowerCase().replace(/^www\./, '');
  if (candidate && looksLikeDomain(candidate)) return candidate;
  return hostnameFromUrl(rawUrl);
}
