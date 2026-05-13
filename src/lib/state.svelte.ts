import type { Location, Unit } from './types';

const LS = {
  unit: 'cw.unit',
  keys: {
    owm: 'cw.key.owm',
    wapi: 'cw.key.wapi',
    tio: 'cw.key.tio',
  },
  favorites: 'cw.favorites',
  lastLocation: 'cw.lastLocation',
};

const readJSON = <T>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore quota */ }
};

const readSessionJSON = <T>(k: string, fallback: T): T => {
  try {
    const v = sessionStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeSessionJSON = (k: string, v: unknown) => {
  try {
    if (v == null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, JSON.stringify(v));
  } catch { /* ignore */ }
};

const isUnit = (v: string | null): v is Unit => v === 'C' || v === 'F';

export const appState = $state({
  unit: (() => {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem(LS.unit) : null;
    return isUnit(v) ? v : 'C';
  })() as Unit,
  keys: {
    owm:  typeof localStorage !== 'undefined' ? localStorage.getItem(LS.keys.owm)  ?? '' : '',
    wapi: typeof localStorage !== 'undefined' ? localStorage.getItem(LS.keys.wapi) ?? '' : '',
    tio:  typeof localStorage !== 'undefined' ? localStorage.getItem(LS.keys.tio)  ?? '' : '',
  },
  favorites: typeof localStorage !== 'undefined' ? readJSON<Location[]>(LS.favorites, []) : [],
  location: typeof sessionStorage !== 'undefined' ? readSessionJSON<Location | null>(LS.lastLocation, null) : null,
  lastUpdated: null as Date | null,
});

export const setUnit = (u: Unit) => {
  appState.unit = u;
  try { localStorage.setItem(LS.unit, u); } catch { /* ignore */ }
};

export const setKeys = (k: { owm: string; wapi: string; tio: string }) => {
  appState.keys = { ...k };
  try {
    localStorage.setItem(LS.keys.owm, k.owm);
    localStorage.setItem(LS.keys.wapi, k.wapi);
    localStorage.setItem(LS.keys.tio, k.tio);
  } catch { /* ignore */ }
};

export const setLocation = (loc: Location | null) => {
  appState.location = loc;
  writeSessionJSON(LS.lastLocation, loc);
  try { localStorage.removeItem(LS.lastLocation); } catch { /* ignore */ }
};

const sameLoc = (a: Location, b: Location) =>
  Math.abs(a.lat - b.lat) < 1e-3 && Math.abs(a.lon - b.lon) < 1e-3;

export const isFavorite = (loc: Location): boolean =>
  appState.favorites.some((f) => sameLoc(f, loc));

export const toggleFavorite = (loc: Location) => {
  const exists = appState.favorites.find((f) => sameLoc(f, loc));
  if (exists) {
    appState.favorites = appState.favorites.filter((f) => !sameLoc(f, loc));
  } else {
    appState.favorites = [...appState.favorites, loc];
  }
  writeJSON(LS.favorites, appState.favorites);
};

export const removeFavorite = (loc: Location) => {
  appState.favorites = appState.favorites.filter((f) => !sameLoc(f, loc));
  writeJSON(LS.favorites, appState.favorites);
};

export const markUpdated = () => { appState.lastUpdated = new Date(); };
