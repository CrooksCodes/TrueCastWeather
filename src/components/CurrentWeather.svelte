<script lang="ts">
  import type { ConsensusSummary, Location } from '../lib/types';
  import { appState, isFavorite, toggleFavorite } from '../lib/state.svelte';
  import { fmtTemp, fmtHum, fmtWind, tempSymbol, windUnit } from '../lib/utils/units';
  import { weatherInfo } from '../lib/utils/weather';
  import WeatherIcon from './WeatherIcon.svelte';
  import DisagreementBadge from './DisagreementBadge.svelte';

  interface Props {
    summary: ConsensusSummary;
    location: Location;
    isDay: boolean;
    weatherCode: number | null;
    lastUpdated: Date | null;
  }
  const { summary, location, isDay, weatherCode, lastUpdated }: Props = $props();

  const wx = $derived(weatherInfo(weatherCode, isDay));
  const favorite = $derived(isFavorite(location));
  const updatedText = $derived(
    lastUpdated ? lastUpdated.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '—',
  );
</script>

<section class="hero card fade-in">
  <div class="hero-top">
    <div class="place">
      <button
        class="fav"
        class:on={favorite}
        title={favorite ? 'Remove from saved' : 'Save this location'}
        aria-label={favorite ? 'Remove from saved' : 'Save this location'}
        onclick={() => toggleFavorite(location)}
      >
        {favorite ? '★' : '☆'}
      </button>
      <div>
        <div class="name">{location.name}{location.admin1 ? ', ' + location.admin1 : ''}</div>
        <div class="sub">
          {location.country ? location.country + ' · ' : ''}{location.lat.toFixed(2)}, {location.lon.toFixed(2)} · updated {updatedText}
        </div>
      </div>
    </div>
    <DisagreementBadge
      score={summary.disagreement}
      spread={summary.spread}
      count={summary.count}
    />
  </div>

  <div class="hero-main">
    <div class="big">
      <div class="temp">
        <span class="num">{fmtTemp(summary.temp, appState.unit, false)}</span>
        <span class="unit">{tempSymbol(appState.unit)}</span>
      </div>
      <div class="condition">
        <div class="cond-label">{wx.label}</div>
        <div class="range">
          range {fmtTemp(summary.tempMin, appState.unit, false)} – {fmtTemp(summary.tempMax, appState.unit, true)}
          across {summary.count} of {summary.total} sources
        </div>
      </div>
    </div>
    <div class="big-icon">
      <WeatherIcon kind={wx.icon} size={140} />
    </div>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="label">Feels like</div>
      <div class="value">{fmtTemp(summary.feels, appState.unit, true)}</div>
      <div class="sub">averaged</div>
    </div>
    <div class="metric">
      <div class="label">Humidity</div>
      <div class="value">{fmtHum(summary.humidity)}</div>
      <div class="sub">relative</div>
    </div>
    <div class="metric">
      <div class="label">Wind</div>
      <div class="value">{fmtWind(summary.wind, appState.unit)}</div>
      <div class="sub">{windUnit(appState.unit)}</div>
    </div>
    <div class="metric">
      <div class="label">Sources</div>
      <div class="value">{summary.count}<span class="of">/{summary.total}</span></div>
      <div class="sub">live readings</div>
    </div>
  </div>
</section>

<style>
  .hero { padding: 28px; position: relative; overflow: hidden; }
  @media (max-width: 640px) { .hero { padding: 20px; } }

  .hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .place { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
  .fav {
    background: transparent;
    border: 1px solid var(--line);
    width: 32px; height: 32px;
    border-radius: 50%;
    color: var(--text-mute);
    font-size: 16px;
    line-height: 1;
    transition: all var(--dur) var(--ease);
    flex-shrink: 0;
  }
  .fav:hover { color: var(--warn); border-color: var(--warn); }
  .fav.on { color: var(--warn); border-color: var(--warn); background: rgba(255, 184, 107, 0.10); }

  .name { font-size: 18px; font-weight: 600; }
  .sub  { color: var(--text-mute); font-size: 12px; margin-top: 2px; }

  .hero-main {
    margin-top: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .big { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .temp { display: flex; align-items: baseline; gap: 6px; }
  .num {
    font-size: clamp(64px, 12vw, 128px);
    line-height: 1;
    font-weight: 500;
    letter-spacing: -3px;
    color: var(--text);
    font-feature-settings: "tnum";
  }
  .unit { font-size: 28px; color: var(--text-dim); font-weight: 500; }
  .condition { margin-top: 4px; }
  .cond-label { font-size: 16px; font-weight: 500; color: var(--text); }
  .range { color: var(--text-mute); font-size: 12px; margin-top: 2px; }

  .big-icon { flex-shrink: 0; opacity: 0.95; filter: drop-shadow(0 6px 24px rgba(0, 0, 0, 0.4)); }
  @media (max-width: 640px) { .big-icon :global(svg) { width: 88px; height: 88px; } }

  .metrics {
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  .metric {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    padding: 14px;
  }
  .metric .label {
    color: var(--text-mute);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 600;
  }
  .metric .value { font-size: 22px; font-weight: 600; margin-top: 6px; letter-spacing: -0.3px; }
  .metric .value .of { color: var(--text-mute); font-size: 14px; font-weight: 400; }
  .metric .sub { color: var(--text-mute); font-size: 11px; margin-top: 4px; }
</style>
