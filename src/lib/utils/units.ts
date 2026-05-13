import type { Unit } from '../types';

export const cToF = (c: number | null | undefined): number | null =>
  c == null ? null : (c * 9) / 5 + 32;

export const kmhToMph = (k: number | null | undefined): number | null =>
  k == null ? null : k * 0.621371;

export const fmtTemp = (c: number | null | undefined, unit: Unit, withDeg = true): string => {
  if (c == null || Number.isNaN(c)) return '—';
  const v = unit === 'F' ? cToF(c)! : c;
  return Math.round(v * 10) / 10 + (withDeg ? '°' : '');
};

export const fmtTempInt = (c: number | null | undefined, unit: Unit, withDeg = true): string => {
  if (c == null || Number.isNaN(c)) return '—';
  const v = unit === 'F' ? cToF(c)! : c;
  return Math.round(v) + (withDeg ? '°' : '');
};

export const fmtWind = (kmh: number | null | undefined, unit: Unit): string => {
  if (kmh == null || Number.isNaN(kmh)) return '—';
  if (unit === 'F') return Math.round(kmhToMph(kmh)!) + ' mph';
  return Math.round(kmh) + ' km/h';
};

export const windUnit = (unit: Unit) => (unit === 'F' ? 'mph' : 'km/h');

export const fmtHum = (h: number | null | undefined): string =>
  h == null || Number.isNaN(h) ? '—' : Math.round(h) + '%';

export const fmtPct = (p: number | null | undefined): string =>
  p == null || Number.isNaN(p) ? '—' : Math.round(p) + '%';

export const tempSymbol = (unit: Unit) => (unit === 'F' ? '°F' : '°C');

export const compassDir = (deg: number | null | undefined): string => {
  if (deg == null || Number.isNaN(deg)) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) / 45)) % 8]!;
};
