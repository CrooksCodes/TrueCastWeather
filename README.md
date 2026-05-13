# Truecast

> the forecast, narrowed

A small web app that solves a small frustration: every weather app shows a
slightly different temperature. **Truecast** polls multiple meteorological
models in parallel, averages them, and shows you the **3 sources closest to
consensus** so you can see who actually agrees — plus a 24-hour chart, 7-day
outlook, air quality, sun & UV, and a model-disagreement score.

Live at **[jeremycrooks.ca](https://jeremycrooks.ca)**.

## Features

- Averages live readings from up to 10 sources (6 distinct forecast models out
  of the box, plus optional paid APIs)
- City search with live autocomplete, or browser geolocation
- Pin favorite locations — they survive page reloads
- **Top 3** cards highlight the sources closest to the consensus median
- **Disagreement badge** flags when models diverge sharply (often a sign of an
  approaching weather transition)
- **Hourly chart** (next 24 h) with consensus line plus a model-spread band
- **7-day outlook** with hi/lo bars and precipitation probability
- **Air quality** card with European AQI plus PM2.5 / PM10 / O₃ / NO₂ / SO₂
- **Sun & UV** card with sun-position arc, sunrise/sunset, UV index
- Animated sky background that reflects current conditions (clear / cloudy /
  rain / snow / thunder / fog) — respects `prefers-reduced-motion`
- Animated SVG weather icons
- °C / °F toggle, persisted between visits
- Auto-refresh every 10 minutes when the tab is visible
- Mobile-first responsive layout
- No tracking, no backend, no cookies

## Sources used

Out of the box (no API keys required, all CORS-friendly):

| Source                            | Operator                                       |
|-----------------------------------|-----------------------------------------------|
| Open-Meteo (ensemble best-match)  | Open-Meteo                                     |
| NOAA GFS                          | US National Oceanic and Atmospheric Admin.     |
| ECMWF IFS                         | European Centre for Medium-Range Weather       |
| DWD ICON                          | Deutscher Wetterdienst (Germany)               |
| ECCC GEM                          | Environment & Climate Change Canada            |
| JMA                               | Japan Meteorological Agency                    |
| NWS observations                  | US National Weather Service (US locations)     |

Optionally enabled by pasting an API key into the **Settings** disclosure:

- OpenWeatherMap
- WeatherAPI.com
- Tomorrow.io

Keys are stored only in `localStorage` and sent only to the matching provider.

## Tech

- **Svelte 5** + **TypeScript** + **Vite** — small bundle (~31 KB gzipped JS),
  no runtime framework overhead
- **No CSS framework** — hand-rolled tokens, scoped styles per component
- **Hand-rolled SVG charts and icons** — no chart or icon library

## Run it

```bash
npm install
npm run dev          # dev server on http://localhost:5173
npm run build        # type-check + production bundle in dist/
npm run preview      # serve the built bundle locally
```

> Geolocation needs `https://` or `localhost` — it won't work over `file://`.

## Deploy

Run `npm run build` and copy `dist/` to any static host (your web root, GitHub
Pages, Netlify, Cloudflare Pages, S3 + CloudFront, etc.).

## Project layout

```
.
├── index.html             # Vite entry
├── src/
│   ├── main.ts            # mount App
│   ├── App.svelte         # composes everything, runs the fetch cycle
│   ├── app.css            # design tokens + base layout
│   ├── components/        # one file per UI piece
│   └── lib/
│       ├── state.svelte.ts  # global runes-based state + localStorage
│       ├── types.ts         # shared types
│       ├── sources/         # one file per weather provider
│       ├── api/             # forecast, air-quality, geocoding
│       └── utils/           # units, stats, format, weather-code mapping
├── CLAUDE.md              # context for AI assistants
├── README.md              # this file
└── package.json
```

## Extending it

See [`CLAUDE.md`](./CLAUDE.md) for architecture notes and the `Source`
contract — adding a new provider is one new file in `src/lib/sources/`.

## License

MIT.
