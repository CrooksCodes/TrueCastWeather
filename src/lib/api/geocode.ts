import type { Location } from '../types';

interface OmGeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export async function searchLocations(q: string, limit = 6): Promise<Location[]> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
    `&count=${limit}&language=en&format=json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Geocoding failed');
  const j = await r.json();
  const results = (j.results ?? []) as OmGeoResult[];
  return results.map((g) => ({
    name: g.name,
    admin1: g.admin1,
    country: g.country ?? '',
    lat: g.latitude,
    lon: g.longitude,
  }));
}

export async function geocodeFirst(q: string): Promise<Location> {
  const all = await searchLocations(q, 1);
  if (!all.length) throw new Error(`No matches found for "${q}"`);
  return all[0]!;
}

export async function reverseGeocode(lat: number, lon: number): Promise<Location> {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    );
    if (r.ok) {
      const j = await r.json();
      const name = j.city || j.locality || j.principalSubdivision || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      return { name, country: j.countryName ?? '', admin1: j.principalSubdivision, lat, lon };
    }
  } catch { /* fall through */ }
  return { name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, country: '', lat, lon };
}
