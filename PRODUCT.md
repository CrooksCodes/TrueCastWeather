# Product

## Register

product

## Users

Primarily Jeremy Crooks (the maker), plus visitors who land on jeremycrooks.ca
and decide to poke at the weather tool. Two contexts:

- **Glance**: pull up the page, read the consensus number, leave. Should feel
  immediate.
- **Investigate**: model A says 12°C, model B says 18°C — which sources are
  closest to consensus, what's the spread, what does the next 24 h look like,
  is the disagreement a sign of an incoming front?

## Product Purpose

The antidote to "every weather app shows a different temperature." Polls
multiple meteorological models in parallel, averages them, and surfaces the
3 sources closest to consensus plus a model-disagreement score. Depth (hourly
chart with model-spread band, 7-day outlook, air quality, sun & UV) is there
so it stands on its own as a real weather app, not a single-trick widget.

Success looks like: a visitor sees the consensus number, immediately understands
how confident it is (via the disagreement signal), and can drill into the
hourly/daily/sources detail without leaving the page.

## Brand Personality

Atmospheric. The interface itself should feel like weather — sky, light,
motion, depth — rather than a tabular readout *about* weather. Calm and
confident at rest, alive when something interesting is happening.

Three words: **atmospheric, confident, considered.**

## Anti-references

- Generic SaaS dashboards (Bootstrap-card grids, neutral-gray-on-white).
- Consumer weather apps that hide the underlying data behind cartoonish
  illustrations and ad slots (Weather Channel, AccuWeather web).
- "AI weather" landing pages with hero-metric cliché + gradient text.
- Glassmorphism-as-decoration. Glass and depth are part of the atmosphere
  here, but only when the layering means something.

## Design Principles

1. **The interface is the weather.** The current sky, time of day, and
   conditions should be felt in the chrome, not just labelled in the data.
2. **Honest about uncertainty.** Disagreement between sources is information,
   not noise. Surface it, don't hide it behind a single confident number.
3. **Depth on demand.** A glance gives you the consensus. A scroll or tab
   gives you the model spread, the hourly band, the per-source breakdown.
   Never force the depth on someone who only wanted the number.
4. **Single-file philosophy in spirit.** Even though we have a build step
   now, the deploy is one folder. No backend, no tracking, no cookies.
5. **Quiet by default, alive on interaction.** Motion exists, but it serves
   the data (sun arc tracking real time, hover marker on chart, animated
   weather background reflecting real conditions). Respect
   `prefers-reduced-motion`.

## Accessibility & Inclusion

- Target WCAG AA. Tinted-neutral dark theme with sufficient contrast on
  text and interactive elements.
- `prefers-reduced-motion` disables the heavy ambient animations (sky,
  weather icons, chart reveals).
- Keyboard navigation across search autocomplete, unit toggle, saved
  locations, and chart hover.
- All weather state communicated in text (icons + labels), never icon-only.
