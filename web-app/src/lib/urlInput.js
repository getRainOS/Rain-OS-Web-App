// URL fields start with "https://" already typed, so people only add the
// address. Pasting a full URL (with or without a scheme) still works: any
// repeated scheme is collapsed, and clearing the field puts the prefix back.
export const HTTPS = 'https://';

export function normalizeUrlInput(raw, prefix = HTTPS) {
  const v = (raw || '').trim();
  if (!v) return prefix;
  if (v.toLowerCase().startsWith(prefix.toLowerCase())) {
    return prefix + v.slice(prefix.length).replace(/^https?:\/\//i, '');
  }
  if (prefix === HTTPS && /^http:\/\//i.test(v)) return v.replace(/^(http:\/\/)+/i, 'http://');
  return prefix + v.replace(/^(https?:\/\/)+/i, '');
}

// True when there is something after the prefix.
export function hasUrlBody(v, prefix = HTTPS) {
  return (v || '').trim().length > prefix.length;
}
