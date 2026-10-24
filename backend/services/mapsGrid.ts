// services/mapsGrid.ts — where a local business shows up on Google Maps across
// its area. A grid of points around the business; at each point we search
// Google Maps for the service as if the customer stood there and record the
// business's position (DataForSEO maps search with a location_coordinate).
// Built from DataForSEO's documented API and not yet run against it: the
// route stays off until DATAFORSEO_VERIFIED=true (see api/maps-grid.ts).
import { dfs, parseProfile, parseMaps, placeName } from './localListingService';
import { extractDomain } from './citationCheckService';

export interface GridPoint { row: number; col: number; lat: number; lng: number; position: number | null }
export interface MapsGrid {
  query: string;
  center: { lat: number; lng: number };
  size: number;         // points per side (size × size)
  spacingKm: number;
  points: GridPoint[];
  summary: { top3: number; top10: number; found: number; total: number; averagePosition: number | null };
  checkedAt: string;
}

export const GRID_SIZES = [3, 5, 7] as const;
export const DEFAULT_SIZE = 5;
export const DEFAULT_SPACING_KM = 1.6; // about a mile between points

// Points in a square around the centre, row by row from the north-west.
export function buildGrid(center: { lat: number; lng: number }, size: number, spacingKm: number): Array<Omit<GridPoint, 'position'>> {
  const half = (size - 1) / 2;
  const kmPerDegLat = 110.574;
  const kmPerDegLng = 111.32 * Math.cos((center.lat * Math.PI) / 180);
  const out: Array<Omit<GridPoint, 'position'>> = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      out.push({
        row, col,
        lat: +(center.lat + ((half - row) * spacingKm) / kmPerDegLat).toFixed(6),
        lng: +(center.lng + ((col - half) * spacingKm) / kmPerDegLng).toFixed(6),
      });
    }
  }
  return out;
}

export function summarize(points: GridPoint[]): MapsGrid['summary'] {
  const found = points.filter(p => p.position !== null) as Array<GridPoint & { position: number }>;
  return {
    top3: found.filter(p => p.position <= 3).length,
    top10: found.filter(p => p.position <= 10).length,
    found: found.length,
    total: points.length,
    averagePosition: found.length ? +(found.reduce((s, p) => s + p.position, 0) / found.length).toFixed(1) : null,
  };
}

export async function runMapsGrid(input: {
  businessName: string;
  city: string;
  state: string | null;
  service: string;
  url: string | null;
  size?: number;
  spacingKm?: number;
}): Promise<MapsGrid> {
  const size = (GRID_SIZES as readonly number[]).includes(input.size ?? 0) ? input.size! : DEFAULT_SIZE;
  const spacingKm = Math.min(5, Math.max(0.5, input.spacingKm ?? DEFAULT_SPACING_KM));
  const location = placeName(input.city, input.state);

  // The grid is centred on the business's own pin from its Google profile.
  const profile = parseProfile(await dfs('POST', '/business_data/google/my_business_info/live', [{ keyword: `${input.businessName} ${input.city}`, location_name: location, language_code: 'en' }]));
  if (!profile?.latitude || !profile?.longitude) {
    throw Object.assign(new Error("We couldn't find your business's location on Google. Check the name and city match your Google Business Profile."), { status: 422 });
  }
  const center = { lat: profile.latitude, lng: profile.longitude };
  const you = { name: profile.name || input.businessName, domain: input.url ? extractDomain(input.url) : null };
  const query = input.service.trim();

  const grid = buildGrid(center, size, spacingKm);
  // One maps search per point, a few at a time.
  const points: GridPoint[] = [];
  for (let i = 0; i < grid.length; i += 5) {
    const batch = await Promise.all(grid.slice(i, i + 5).map(async g => {
      const json = await dfs('POST', '/serp/google/maps/live/advanced', [{
        keyword: query, location_coordinate: `${g.lat},${g.lng},14z`, language_code: 'en', depth: 20,
      }]).catch(() => null);
      const hit = json ? parseMaps(json, you).find(e => e.isYou) : undefined;
      return { ...g, position: hit ? hit.position : null };
    }));
    points.push(...batch);
  }
  return { query, center, size, spacingKm, points, summary: summarize(points), checkedAt: new Date().toISOString() };
}
