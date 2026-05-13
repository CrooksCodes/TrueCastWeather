import type { ForecastBundle, HourlyData, DailyPoint, AirQuality } from '../types';

const FORECAST_MODELS = ['gfs_seamless', 'ecmwf_ifs025', 'icon_seamless'];

/**
 * Pull a multi-model hourly + daily forecast from Open-Meteo, plus current
 * sun/UV. Hourly is fetched per-model so we can render a spread band; daily
 * uses the ensemble best-match.
 */
export async function fetchForecast(lat: number, lon: number): Promise<ForecastBundle> {
  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'precipitation_sum',
    'weather_code',
    'sunrise',
    'sunset',
    'uv_index_max',
  ].join(',');
  const currentParams = ['weather_code', 'is_day', 'uv_index'].join(',');

  const ensembleUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,is_day` +
    `&daily=${dailyParams}` +
    `&current=${currentParams}` +
    `&forecast_days=7&timezone=auto&temperature_unit=celsius&wind_speed_unit=kmh`;

  const modelHourlyUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m&models=${FORECAST_MODELS.join(',')}` +
    `&forecast_days=2&timezone=auto&temperature_unit=celsius`;

  const [ensembleR, modelsR] = await Promise.all([
    fetch(ensembleUrl).then((r) => r.json()),
    fetch(modelHourlyUrl).then((r) => r.json()).catch(() => null),
  ]);

  const hourly = parseHourly(ensembleR, modelsR);
  const daily = parseDaily(ensembleR);
  const cur = ensembleR.current ?? {};

  return {
    hourly,
    daily,
    air: null, // filled in by fetchAirQuality
    current: {
      sunrise: daily[0]?.sunrise ?? null,
      sunset: daily[0]?.sunset ?? null,
      uv: cur.uv_index ?? daily[0]?.uvMax ?? null,
      isDay: cur.is_day === 1 || cur.is_day === true,
      weatherCode: cur.weather_code ?? null,
      timezone: ensembleR.timezone ?? null,
      timezoneAbbr: ensembleR.timezone_abbreviation ?? null,
    },
  };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality | null> {
  try {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide&timezone=auto`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    const c = j.current ?? {};
    return {
      aqi: c.european_aqi ?? null,
      pm25: c.pm2_5 ?? null,
      pm10: c.pm10 ?? null,
      o3: c.ozone ?? null,
      no2: c.nitrogen_dioxide ?? null,
      so2: c.sulphur_dioxide ?? null,
    };
  } catch {
    return null;
  }
}

function parseHourly(ensemble: any, models: any): HourlyData {
  const h = ensemble.hourly ?? {};
  const times: string[] = h.time ?? [];
  const temps: (number | null)[] = h.temperature_2m ?? [];
  const probs: (number | null)[] = h.precipitation_probability ?? [];
  const codes: (number | null)[] = h.weather_code ?? [];
  const isDay: (number | null)[] = h.is_day ?? [];

  // Take the next 24 hours starting at "now or after".
  const now = Date.now();
  let start = times.findIndex((t) => new Date(t).getTime() >= now - 30 * 60 * 1000);
  if (start < 0) start = 0;
  const end = Math.min(start + 24, times.length);

  const points = [];
  for (let i = start; i < end; i++) {
    points.push({
      time: times[i]!,
      temp: temps[i] ?? null,
      precipProb: probs[i] ?? null,
      weatherCode: codes[i] ?? null,
      isDay: isDay[i] === 1,
    });
  }

  // Build min/max bands across the model hourly arrays, aligned to the same hours.
  let bands: { min: number; max: number }[] | null = null;
  if (models?.hourly) {
    const mh = models.hourly;
    const mTimes: string[] = mh.time ?? [];
    const arrays: (number | null)[][] = FORECAST_MODELS
      .map((m) => mh[`temperature_2m_${m}`])
      .filter(Boolean);
    if (arrays.length >= 2) {
      bands = [];
      for (let i = start; i < end; i++) {
        const t = times[i]!;
        const j = mTimes.indexOf(t);
        if (j < 0) { bands.push({ min: NaN, max: NaN }); continue; }
        const vals = arrays.map((a) => a[j]).filter((v): v is number => v != null);
        if (!vals.length) { bands.push({ min: NaN, max: NaN }); continue; }
        bands.push({ min: Math.min(...vals), max: Math.max(...vals) });
      }
    }
  }

  return { points, bands };
}

function parseDaily(ensemble: any): DailyPoint[] {
  const d = ensemble.daily ?? {};
  const dates: string[] = d.time ?? [];
  return dates.map((date, i) => ({
    date,
    hi: d.temperature_2m_max?.[i] ?? null,
    lo: d.temperature_2m_min?.[i] ?? null,
    precipProb: d.precipitation_probability_max?.[i] ?? null,
    precipMm: d.precipitation_sum?.[i] ?? null,
    weatherCode: d.weather_code?.[i] ?? null,
    sunrise: d.sunrise?.[i] ?? null,
    sunset: d.sunset?.[i] ?? null,
    uvMax: d.uv_index_max?.[i] ?? null,
  }));
}
