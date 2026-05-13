import { appState } from '../state.svelte';
import type { Reading, Source } from '../types';

export function owmSource(): Source {
  return {
    id: 'owm',
    name: 'OpenWeatherMap',
    agency: 'OpenWeather',
    enabled: () => !!appState.keys.owm,
    async fetch(lat: number, lon: number): Promise<Reading> {
      const k = appState.keys.owm;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${k}&units=metric`;
      const r = await fetch(url);
      if (!r.ok) return { ok: false, note: 'HTTP ' + r.status };
      const j = await r.json();
      return {
        ok: true,
        temp: j.main?.temp,
        feels: j.main?.feels_like,
        humidity: j.main?.humidity,
        wind: j.wind?.speed != null ? j.wind.speed * 3.6 : null,
        windDir: j.wind?.deg,
        pressure: j.main?.pressure,
      };
    },
  };
}

export function weatherApiSource(): Source {
  return {
    id: 'wapi',
    name: 'WeatherAPI.com',
    agency: 'WeatherAPI',
    enabled: () => !!appState.keys.wapi,
    async fetch(lat: number, lon: number): Promise<Reading> {
      const k = appState.keys.wapi;
      const url = `https://api.weatherapi.com/v1/current.json?key=${k}&q=${lat},${lon}`;
      const r = await fetch(url);
      if (!r.ok) return { ok: false, note: 'HTTP ' + r.status };
      const j = await r.json();
      const c = j.current ?? {};
      return {
        ok: true,
        temp: c.temp_c,
        feels: c.feelslike_c,
        humidity: c.humidity,
        wind: c.wind_kph,
        windDir: c.wind_degree,
        pressure: c.pressure_mb,
      };
    },
  };
}

export function tomorrowSource(): Source {
  return {
    id: 'tio',
    name: 'Tomorrow.io',
    agency: 'Tomorrow.io',
    enabled: () => !!appState.keys.tio,
    async fetch(lat: number, lon: number): Promise<Reading> {
      const k = appState.keys.tio;
      const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&units=metric&apikey=${k}`;
      const r = await fetch(url);
      if (!r.ok) return { ok: false, note: 'HTTP ' + r.status };
      const j = await r.json();
      const v = j.data?.values ?? {};
      return {
        ok: true,
        temp: v.temperature,
        feels: v.temperatureApparent,
        humidity: v.humidity,
        wind: v.windSpeed != null ? v.windSpeed * 3.6 : null,
        windDir: v.windDirection,
        pressure: v.pressureSurfaceLevel,
      };
    },
  };
}
