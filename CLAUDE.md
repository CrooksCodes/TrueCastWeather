# Truecast

A small web app that averages live weather readings from multiple
meteorological models. Highlights the 3 sources closest to the consensus,
shows a 24-hour chart, 7-day outlook, air quality, sun & UV, and a model
disagreement score. Hosted at `jeremycrooks.ca` (or any static host).

## Quick orientation

- **Stack:** Svelte 5 (runes mode) + TypeScript + Vite. No CSS framework.
- **Entry:** `index.html` → `src/main.ts` → `src/App.svelte`.
- **Run locally:** `npm install && npm run dev` → http://localhost:5173.
  Geolocation needs `https://` or `localhost`.
- **Build:** `npm run build` (type-check + Vite build → `dist/`).
- **Deploy:** copy `dist/` to any static host.

## Architecture

```
src/
├── main.ts                     mount Svelte app
├── App.svelte                  shell: fetch cycle, auto-refresh, layout
├── app.css                     design tokens + global layout
├── components/                 one Svelte file per UI piece
│   ├── AnimatedSky.svelte      full-screen animated weather background
│   ├── Header.svelte           brand + °C/°F toggle
│   ├── SearchBar.svelte        autocomplete city search + geolocation
│   ├── SavedLocations.svelte   pinned favorites (localStorage)
│   ├── CurrentWeather.svelte   hero: big consensus temp + metrics
│   ├── DisagreementBadge.svelte  spread/divergence pill
│   ├── TopSources.svelte       3 source cards closest to median
│   ├── HourlyChart.svelte      24-h SVG line chart + model spread band
│   ├── DailyForecast.svelte    7-day list with hi/lo bars + precip%
│   ├── AirQualityCard.svelte   European AQI + pollutants
│   ├── SunUVCard.svelte        sun-arc + sunrise/sunset + UV
│   ├── SourcesTable.svelte     all-sources tabular view
│   ├── ApiKeysPanel.svelte     paid-API-key disclosure
│   └── WeatherIcon.svelte      animated SVG icons (16 kinds)
└── lib/
    ├── state.svelte.ts         global runes store + localStorage I/O
    ├── types.ts                shared types
    ├── sources/                weather-source modules (the heart)
    │   ├── registry.ts         the array of enabled sources
    │   ├── openMeteo.ts        Open-Meteo per-model factory
    │   ├── nws.ts              US NWS observations
    │   └── paid.ts             OWM / WeatherAPI / Tomorrow.io (key-gated)
    ├── api/
    │   ├── geocode.ts          Open-Meteo + BigDataCloud reverse geocode
    │   └── forecast.ts         hourly + daily + air-quality endpoints
    └── utils/
        ├── units.ts            °C↔°F, km/h↔mph, formatters
        ├── stats.ts            median, mean, disagreement score
        ├── format.ts           date/time formatting + escapeHtml
        └── weather.ts          WMO code → label/icon, AQI/UV bins
```

### Why this design

- **Sources via Open-Meteo `models=` parameter:** rather than juggling many
  paid API keys, we ask Open-Meteo for individual forecast models (GFS, ECMWF,
  ICON, GEM, JMA, plus the ensemble best-match). Each is a real, distinct
  meteorological model — so we get genuine multi-source averaging through one
  CORS-friendly endpoint.
- **`Promise.allSettled` over `Promise.all`:** one slow or dead source must
  never block the page.
- **Top 3 = closest to median temp:** more meaningful than picking arbitrary
  sources. It surfaces the consensus group and de-emphasizes outliers.
- **Disagreement score** maps the temperature spread (max − min) to a 0..1
  scale, with `<0.5°C → 0` and `>5°C → 1`. Drives the colored pill in the
  hero. High disagreement often signals an approaching weather transition.
- **Hourly chart spread band** is built from three named models (GFS, ECMWF,
  ICON) — a wide band visually flags model uncertainty for the next 24 h.
- **Optional paid sources** are pre-wired but `enabled()` returns false until
  a key is pasted into Settings. Keys live in `localStorage` only.

### State (Svelte 5 runes)

`src/lib/state.svelte.ts` exports a single `appState` rune-state object
holding: `unit`, `keys`, `favorites`, `location`, `lastUpdated`. Helpers
(`setUnit`, `setKeys`, `setLocation`, `toggleFavorite`, `markUpdated`)
mutate it and persist to `localStorage`.

> **Naming gotcha:** import as `appState`, not `state`. Naming the local
> binding `state` clashes with the `$state(...)` rune (the Svelte compiler
> reads `$state` as a store subscription on a local `state`).

## Adding a new weather source

Add a factory in `src/lib/sources/` and push it into the `sources` array in
`registry.ts`. The contract:

```ts
import type { Reading, Source } from '../types';

export function mySource(): Source {
  return {
    id: 'my-source',
    name: 'Display name',
    agency: 'Operator',
    enabled: () => true,
    async fetch(lat, lon): Promise<Reading> {
      // hit the API
      return {
        ok: true,
        temp: 12.3,         // °C
        feels: 11.1,        // °C
        humidity: 78,       // %
        wind: 14,           // km/h
        windDir: 220,       // degrees (optional)
        pressure: 1012,     // hPa (optional)
        weatherCode: 2,     // WMO weather code (optional)
      };
    },
  };
}
```

Conventions:

- **Always return metric** (°C, km/h, %, hPa). The render layer handles unit
  conversion.
- Return `{ ok: false, note: 'reason' }` for "I'm fine but I have no data
  here" (e.g. NWS outside US). Throw for unexpected errors.
- Keep `fetch()` under a few seconds — `Promise.allSettled` shields the page
  but slow sources hurt UX.
- Don't read or write `appState` from inside `fetch` — keep sources pure.
- Must support browser CORS, or it can't be added without a backend proxy.

## Conventions

- **Svelte 5 runes mode** — use `$state`, `$derived`, `$effect`, `$props`.
  No legacy `export let` props or stores.
- **No external CSS framework** — design tokens in `src/app.css`,
  component-scoped styles otherwise.
- **Mobile-first.** Layout collapses cleanly under 560 px.
- **No tracking, no backend, no cookies.** `localStorage` only.
- **`prefers-reduced-motion`** disables the heavy animations on the sky and
  weather icons.

## Things to be careful with

- **NWS (`api.weather.gov`)** returns 404 outside the US — handled as
  `{ ok: false, note: 'outside US coverage' }`.
- **Open-Meteo models can return `null`** for areas they don't cover well
  (e.g. GEM is strongest over North America). Same handling.
- **Don't log API keys** — they live in `localStorage` and should never appear
  in console output or analytics (there are no analytics — keep it that way).
- **Auto-refresh** runs every 10 minutes but only when the tab is visible
  (`document.visibilityState`).

## Possible next steps

- Service worker for full offline / PWA install.
- Cache the last successful response per location in `localStorage` so the
  page has something to show offline.
- Weather alerts (NWS provides a free alerts feed for US locations).
- A small map preview centered on the location.
