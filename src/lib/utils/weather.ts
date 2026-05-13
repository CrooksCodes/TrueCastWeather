/**
 * WMO weather code → human label, icon kind, and sky type.
 * https://open-meteo.com/en/docs (Weather Code table at the bottom)
 */

export type IconKind =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'rain-heavy'
  | 'snow'
  | 'snow-heavy'
  | 'sleet'
  | 'thunder'
  | 'thunder-hail'
  | 'unknown';

export interface WeatherInfo {
  label: string;
  icon: IconKind;
}

const TABLE: Record<number, { label: string; day: IconKind; night?: IconKind }> = {
  0:  { label: 'Clear sky',          day: 'clear-day',         night: 'clear-night' },
  1:  { label: 'Mainly clear',       day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
  2:  { label: 'Partly cloudy',      day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
  3:  { label: 'Overcast',           day: 'overcast' },
  45: { label: 'Fog',                day: 'fog' },
  48: { label: 'Depositing rime fog', day: 'fog' },
  51: { label: 'Light drizzle',      day: 'drizzle' },
  53: { label: 'Drizzle',            day: 'drizzle' },
  55: { label: 'Heavy drizzle',      day: 'drizzle' },
  56: { label: 'Freezing drizzle',   day: 'sleet' },
  57: { label: 'Heavy freezing drizzle', day: 'sleet' },
  61: { label: 'Light rain',         day: 'rain' },
  63: { label: 'Rain',               day: 'rain' },
  65: { label: 'Heavy rain',         day: 'rain-heavy' },
  66: { label: 'Freezing rain',      day: 'sleet' },
  67: { label: 'Heavy freezing rain', day: 'sleet' },
  71: { label: 'Light snow',         day: 'snow' },
  73: { label: 'Snow',               day: 'snow' },
  75: { label: 'Heavy snow',         day: 'snow-heavy' },
  77: { label: 'Snow grains',        day: 'snow' },
  80: { label: 'Rain showers',       day: 'rain' },
  81: { label: 'Heavy rain showers', day: 'rain-heavy' },
  82: { label: 'Violent rain showers', day: 'rain-heavy' },
  85: { label: 'Snow showers',       day: 'snow' },
  86: { label: 'Heavy snow showers', day: 'snow-heavy' },
  95: { label: 'Thunderstorm',       day: 'thunder' },
  96: { label: 'Thunderstorm with hail', day: 'thunder-hail' },
  99: { label: 'Severe thunderstorm with hail', day: 'thunder-hail' },
};

export const weatherInfo = (
  code: number | null | undefined,
  isDay = true,
): WeatherInfo => {
  if (code == null) return { label: '—', icon: 'unknown' };
  const entry = TABLE[code];
  if (!entry) return { label: 'Unknown', icon: 'unknown' };
  return { label: entry.label, icon: !isDay && entry.night ? entry.night : entry.day };
};

/** A small set of broad sky categories used by the animated background. */
export type SkyKind = 'clear-day' | 'clear-night' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';

export const skyKind = (code: number | null | undefined, isDay = true): SkyKind => {
  if (code == null) return isDay ? 'clear-day' : 'clear-night';
  if (code === 0 || code === 1) return isDay ? 'clear-day' : 'clear-night';
  if (code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunder';
  return 'cloudy';
};

/** AQI 1–5 (Open-Meteo European AQI bins) → label + color. */
export const aqiInfo = (
  aqi: number | null | undefined,
): { label: string; level: number; color: string } => {
  if (aqi == null) return { label: '—', level: 0, color: 'var(--text-mute)' };
  if (aqi <= 20) return { label: 'Good', level: 1, color: 'var(--good)' };
  if (aqi <= 40) return { label: 'Fair', level: 2, color: '#a8e063' };
  if (aqi <= 60) return { label: 'Moderate', level: 3, color: '#ffd166' };
  if (aqi <= 80) return { label: 'Poor', level: 4, color: '#ff8c42' };
  if (aqi <= 100) return { label: 'Very poor', level: 5, color: '#ff5c5c' };
  return { label: 'Extremely poor', level: 6, color: '#a64dff' };
};

export const uvInfo = (
  uv: number | null | undefined,
): { label: string; color: string } => {
  if (uv == null) return { label: '—', color: 'var(--text-mute)' };
  if (uv < 3) return { label: 'Low', color: 'var(--good)' };
  if (uv < 6) return { label: 'Moderate', color: '#ffd166' };
  if (uv < 8) return { label: 'High', color: '#ff8c42' };
  if (uv < 11) return { label: 'Very high', color: '#ff5c5c' };
  return { label: 'Extreme', color: '#a64dff' };
};
