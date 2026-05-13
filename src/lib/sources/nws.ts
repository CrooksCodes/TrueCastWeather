import type { Reading, Source } from '../types';

export function nwsSource(): Source {
  return {
    id: 'nws',
    name: 'NWS (US)',
    agency: 'US National Weather Service',
    enabled: () => true,
    async fetch(lat: number, lon: number): Promise<Reading> {
      const p = await fetch(
        `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
        { headers: { Accept: 'application/geo+json' } },
      );
      if (p.status === 404) return { ok: false, note: 'outside US coverage' };
      if (!p.ok) return { ok: false, note: 'points HTTP ' + p.status };
      const pj = await p.json();
      const stationsUrl = pj.properties?.observationStations as string | undefined;
      if (!stationsUrl) return { ok: false, note: 'no station mapping' };

      const s = await fetch(stationsUrl);
      if (!s.ok) return { ok: false, note: 'stations HTTP ' + s.status };
      const sj = await s.json();
      const station = sj.features?.[0];
      if (!station) return { ok: false, note: 'no nearby station' };

      const stId = station.properties.stationIdentifier as string;
      const o = await fetch(`https://api.weather.gov/stations/${stId}/observations/latest`);
      if (!o.ok) return { ok: false, note: 'obs HTTP ' + o.status };
      const oj = await o.json();
      const op = oj.properties ?? {};
      const tempC: number | null = op.temperature?.value ?? null;
      if (tempC == null) return { ok: false, note: 'no recent observation' };
      const feelsC: number =
        op.windChill?.value ?? op.heatIndex?.value ?? tempC;
      return {
        ok: true,
        temp: tempC,
        feels: feelsC,
        humidity: op.relativeHumidity?.value ?? null,
        wind: op.windSpeed?.value ?? null,
        windDir: op.windDirection?.value ?? null,
        pressure: op.barometricPressure?.value != null
          ? op.barometricPressure.value / 100  // Pa → hPa
          : null,
        note: 'station ' + stId,
      };
    },
  };
}
