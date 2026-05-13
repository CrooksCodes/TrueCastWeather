import type { Reading, Source } from '../types';

export function meteoModelSource(model: string, name: string, agency: string): Source {
  return {
    id: 'om-' + model,
    name,
    agency,
    enabled: () => true,
    async fetch(lat: number, lon: number): Promise<Reading> {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,pressure_msl,weather_code` +
        `&wind_speed_unit=kmh&temperature_unit=celsius&models=${model}&timezone=auto`;
      const r = await fetch(url);
      if (!r.ok) return { ok: false, note: 'HTTP ' + r.status };
      const j = await r.json();
      const c = j.current ?? {};
      if (c.temperature_2m == null) {
        return { ok: false, note: 'no data for this location' };
      }
      return {
        ok: true,
        temp: c.temperature_2m,
        feels: c.apparent_temperature ?? c.temperature_2m,
        humidity: c.relative_humidity_2m,
        wind: c.wind_speed_10m,
        windDir: c.wind_direction_10m,
        pressure: c.pressure_msl,
        weatherCode: c.weather_code,
      };
    },
  };
}
