<script lang="ts">
  import type { ConsensusSummary, Location } from '../../lib/types';
  import { appState, isFavorite, toggleFavorite } from '../../lib/state.svelte';
  import { fmtTemp, fmtTempInt, tempSymbol } from '../../lib/utils/units';
  import { weatherInfo } from '../../lib/utils/weather';
  import WeatherIcon from '../WeatherIcon.svelte';
  import LocalClock from '../LocalClock.svelte';

  interface Props {
    summary: ConsensusSummary;
    location: Location;
    isDay: boolean;
    weatherCode: number | null;
    timezone?: string | null;
    timezoneAbbr?: string | null;
  }
  const {
    summary, location, isDay, weatherCode,
    timezone = null, timezoneAbbr = null,
  }: Props = $props();

  const wx = $derived(weatherInfo(weatherCode, isDay));
  const fav = $derived(isFavorite(location));

  const tone = $derived(
    summary.disagreement < 0.2 ? 'good' :
    summary.disagreement < 0.45 ? 'ok' :
    summary.disagreement < 0.7 ? 'warn' : 'bad',
  );
  const disLabel = $derived(
    summary.disagreement < 0.2 ? 'Models in strong agreement' :
    summary.disagreement < 0.45 ? 'Models mostly agree' :
    summary.disagreement < 0.7 ? 'Some divergence between models' :
    'High divergence — possible weather transition',
  );

  const now = $derived(appState.lastUpdated ?? new Date());
  const dateLine = $derived(now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
    timeZone: timezone ?? undefined,
  }));
</script>

<header class="hero">
  <div class="meta-top">
    <div class="meta">
      <span class="dateline">{dateLine}</span>
      <span class="sep">·</span>
      <span class="timeline"><LocalClock {timezone} abbr={timezoneAbbr} size="md" /></span>
    </div>
    <div class="badges">
      <span class="badge tone-{tone}">
        <span class="b-dot"></span>
        {disLabel}
      </span>
    </div>
  </div>

  <div class="stage">
    <div class="art" aria-hidden="true">
      <WeatherIcon kind={wx.icon} size={240} />
    </div>

    <div class="prime">
      <div class="num-row">
        <span class="num">{fmtTemp(summary.temp, appState.unit, false)}</span>
        <span class="unit">{tempSymbol(appState.unit)}</span>
      </div>
      <div class="cond">{wx.label}</div>
      <div class="range">
        <span>Low {fmtTempInt(summary.tempMin, appState.unit, true)}</span>
        <span class="dot"></span>
        <span>High {fmtTempInt(summary.tempMax, appState.unit, true)}</span>
        <span class="dot"></span>
        <span>Spread {fmtTemp(summary.spread, appState.unit, true)}</span>
      </div>
    </div>
  </div>

  <div class="meta-bottom">
    <div class="loc">
      <button
        class="fav"
        class:on={fav}
        title={fav ? 'Remove from saved' : 'Save this location'}
        aria-label={fav ? 'Remove from saved' : 'Save this location'}
        onclick={() => toggleFavorite(location)}
      >{fav ? '★' : '☆'}</button>
      <h1 class="city">{location.name}{location.admin1 ? ', ' + location.admin1 : ''}</h1>
      <div class="country">{location.country ?? ''}</div>
    </div>
    <div class="counts">
      <span class="count-num">{summary.count}</span>
      <span class="count-label">of {summary.total} sources reporting</span>
    </div>
  </div>

  <nav class="jump" aria-label="Jump to section">
    <a href="#sec-hourly">Hourly</a>
    <span class="j-sep" aria-hidden="true">·</span>
    <a href="#sec-daily">7-day</a>
    <span class="j-sep" aria-hidden="true">·</span>
    <a href="#sec-air">Air</a>
    <span class="j-sep" aria-hidden="true">·</span>
    <a href="#sec-sources">Sources</a>
  </nav>
</header>

<style>
  .hero {
    position: relative;
    min-height: 68vh;
    padding: 64px 6vw 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 18px;
  }

  .meta-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .meta {
    color: var(--text-dim);
    font-size: 13px;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    font-weight: 500;
  }
  .meta .sep { margin: 0 8px; opacity: 0.4; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: oklch(13% 0.018 260 / 0.55);
    border: 1px solid var(--line-strong);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-dim);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .b-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--text-mute);
    box-shadow: 0 0 8px currentColor;
    color: var(--text-mute);
  }
  .badge.tone-good { color: var(--good); border-color: oklch(82% 0.16 155 / 0.30); }
  .badge.tone-good .b-dot { background: var(--good); color: var(--good); }
  .badge.tone-ok { color: var(--accent); border-color: oklch(78% 0.13 240 / 0.30); }
  .badge.tone-ok .b-dot { background: var(--accent); color: var(--accent); }
  .badge.tone-warn { color: var(--warn); border-color: oklch(80% 0.14 70 / 0.30); }
  .badge.tone-warn .b-dot { background: var(--warn); color: var(--warn); }
  .badge.tone-bad { color: var(--bad); border-color: oklch(72% 0.18 25 / 0.30); }
  .badge.tone-bad .b-dot { background: var(--bad); color: var(--bad); }

  .stage {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 32px;
    min-height: 0;
  }
  .art {
    display: grid; place-items: center;
    filter: drop-shadow(0 30px 80px oklch(0% 0 0 / 0.5));
    opacity: 0.92;
  }
  .prime { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .num-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 0.85;
  }
  .num {
    font-family: var(--font-display);
    font-size: clamp(100px, 14vw, 200px);
    line-height: 0.82;
    font-weight: 400;
    letter-spacing: -6px;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  .unit {
    font-family: var(--font-display);
    font-size: clamp(36px, 4vw, 64px);
    color: var(--text-dim);
    font-style: italic;
    font-weight: 400;
    margin-top: 12px;
  }
  .cond {
    font-family: var(--font-display);
    font-size: clamp(24px, 3vw, 44px);
    font-style: italic;
    color: var(--text);
    line-height: 1.1;
  }
  .range {
    color: var(--text-dim);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    display: flex; align-items: center; flex-wrap: wrap;
    gap: 10px;
  }
  .range .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-mute); }

  .meta-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .loc {
    display: flex; align-items: baseline; gap: 12px;
    min-width: 0;
  }
  .fav {
    background: transparent;
    border: 0;
    color: var(--text-mute);
    font-size: 22px;
    cursor: pointer;
    line-height: 1;
    transition: color 200ms;
  }
  .fav:hover, .fav.on { color: var(--warn); }
  .city {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(36px, 5vw, 80px);
    font-weight: 400;
    letter-spacing: -1.5px;
    color: var(--text);
    line-height: 1;
  }
  .country {
    color: var(--text-mute);
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 500;
    align-self: flex-end;
    padding-bottom: 6px;
  }
  .counts {
    text-align: right;
    align-self: flex-end;
    color: var(--text-dim);
    font-size: 12px;
  }
  .count-num {
    font-family: var(--font-display);
    font-size: 36px;
    color: var(--text);
    line-height: 1;
    margin-right: 6px;
    font-variant-numeric: tabular-nums;
  }
  .count-label { display: block; margin-top: 2px; }

  .jump {
    position: absolute;
    bottom: 18px; left: 50%;
    transform: translateX(-50%);
    display: flex; align-items: center; gap: 4px;
    padding: 8px 14px;
    background: oklch(13% 0.018 260 / 0.5);
    border: 1px solid var(--line);
    border-radius: 999px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .jump a {
    color: var(--text-dim);
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 999px;
    font-weight: 500;
    transition: color 200ms, background 200ms;
  }
  .jump a:hover,
  .jump a:active { color: var(--accent); background: oklch(100% 0 0 / 0.05); }
  .j-sep { color: var(--text-mute); opacity: 0.5; }

  @media (max-width: 720px) {
    .hero { padding: 88px 20px 84px; }
    .stage {
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: start;
    }
    .art { order: -1; opacity: 0.7; }
    .art :global(svg) { width: 180px; height: 180px; }
    .num { letter-spacing: -6px; }
    .city { font-size: 30px; line-height: 1.05; }
    .loc {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      min-width: 0;
      flex: 1 1 100%;
    }
    .country { padding-bottom: 0; align-self: flex-start; }
    .meta-bottom { gap: 12px; }
    .counts { text-align: left; }
    .jump { font-size: 10px; bottom: 14px; gap: 2px; padding: 6px 10px; }
    .jump a { padding: 4px 6px; letter-spacing: 1px; }
  }

</style>
