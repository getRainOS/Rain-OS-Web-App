// brandLinkKeys.ts — pure helpers for brand-to-site links.
export const brandKey = (brand: string): string => brand.toLowerCase().replace(/[^a-z0-9]/g, '');

export function normalizeSite(input: string): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return host.includes('.') ? host : null;
  } catch {
    return null;
  }
}
