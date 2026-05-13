export type Unit = 'C' | 'F';

export interface Location {
  name: string;
  country: string;
  lat: number;
  lon: number;
  admin1?: string;
}

export interface Reading {
  ok: boolean;
  temp?: number | null;       // celsius
  feels?: number | null;      // celsius
  humidity?: number | null;   // %
  wind?: number | null;       // km/h
  windDir?: number | null;    // degrees
  pressure?: number | null;   // hPa
  weatherCode?: number | null; // WMO code
  note?: string;
}

export interface Source {
  id: string;
  name: string;
  agency: string;
  enabled: () => boolean;
  fetch: (lat: number, lon: number) => Promise<Reading>;
}

export interface SourceRow {
  src: Source;
  reading: Reading | null;
  ok: boolean;
  error: string | null;
  delta?: number; // distance from consensus temp
}

export interface ConsensusSummary {
  temp: number;
  feels: number;
  humidity: number;
  wind: number;
  weatherCode: number | null;
  tempMin: number;
  tempMax: number;
  medianTemp: number;
  spread: number; // tempMax - tempMin in celsius
  count: number;
  total: number;
  disagreement: number; // 0..1, where 1 = very high spread
}

export interface HourlyPoint {
  time: string;        // ISO
  temp: number | null;
  precipProb: number | null;
  weatherCode: number | null;
  isDay: boolean;
}

export interface HourlyData {
  points: HourlyPoint[];
  // Min/max bands across multiple models for the same hour
  bands: { min: number; max: number }[] | null;
}

export interface DailyPoint {
  date: string;         // ISO
  hi: number | null;
  lo: number | null;
  precipProb: number | null;
  precipMm: number | null;
  weatherCode: number | null;
  sunrise: string | null;
  sunset: string | null;
  uvMax: number | null;
}

export interface AirQuality {
  aqi: number | null;        // European AQI
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  so2: number | null;
}

export interface ForecastBundle {
  hourly: HourlyData;
  daily: DailyPoint[];
  air: AirQuality | null;
  current: {
    sunrise: string | null;
    sunset: string | null;
    uv: number | null;
    isDay: boolean;
    weatherCode: number | null;
    timezone: string | null;       // IANA, e.g. "America/Vancouver"
    timezoneAbbr: string | null;   // e.g. "PDT"
  };
}
