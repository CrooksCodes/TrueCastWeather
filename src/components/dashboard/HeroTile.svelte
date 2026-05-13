<script lang="ts">
  import type { ConsensusSummary, Location } from '../../lib/types';
  import { appState, isFavorite, toggleFavorite } from '../../lib/state.svelte';
  import { fmtTemp, fmtHum, fmtWind, tempSymbol, windUnit } from '../../lib/utils/units';
  import { weatherInfo } from '../../lib/utils/weather';
  import WeatherIcon from '../WeatherIcon.svelte';
  import DisagreementBadge from '../DisagreementBadge.svelte';
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
</script>

<div class="hero">
  <div class="head">
    <div class="loc">
      <button
        class="fav"
        class:on={fav}
        title={fav ? 'Remove from saved' : 'Save this location'}
        aria-label={fav ? 'Remove from saved' : 'Save this location'}
        onclick={() => toggleFavorite(location)}
      >{fav ? '★' : '☆'}</button>
      <div class="loc-text">
        <div class="city">{location.name}{location.admin1 ? ', ' + location.admin1 : ''}</div>
        <div class="region">{location.country ?? ''} · {location.lat.toFixed(2)}, {location.lon.toFixed(2)}</div>
        {#if timezone}
          <div class="clock-row">
            <LocalClock {timezone} abbr={timezoneAbbr} size="sm" />
          </div>
        {/if}
      </div>
    </div>
    <DisagreementBadge
      score={summary.disagreement}
      spread={summary.spread}
      count={summary.count}
    />
  </div>

  <div class="middle">
    <div class="num-wrap">
      <span class="num">{fmtTemp(summary.temp, appState.unit, false)}</span>
      <span class="unit">{tempSymbol(appState.unit)}</span>
    </div>
    <div class="cond">
      <WeatherIcon kind={wx.icon} size={84} />
      <div class="cond-text">
        <div class="cond-label">{wx.label}</div>
        <div class="cond-range">
          {fmtTemp(summary.tempMin, appState.unit, false)} – {fmtTemp(summary.tempMax, appState.unit, true)}
          <span class="muted">range across {summary.count} of {summary.total} sources</span>
        </div>
      </div>
    </div>
  </div>

  <dl class="metrics">
    <div>
      <dt>Feels</dt>
      <dd>{fmtTemp(summary.feels, appState.unit, true)}</dd>
    </div>
    <div>
      <dt>Humidity</dt>
      <dd>{fmtHum(summary.humidity)}</dd>
    </div>
    <div>
      <dt>Wind</dt>
      <dd>{fmtWind(summary.wind, appState.unit)}<span class="u">{windUnit(appState.unit)}</span></dd>
    </div>
    <div>
      <dt>Reporting</dt>
      <dd>{summary.count}<span class="u">/ {summary.total}</span></dd>
    </div>
  </dl>
</div>

<style>
  .hero {
    display: flex; flex-direction: column;
    height: 100%; min-height: 0;
    padding: 22px 26px;
    gap: 14px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }
  .loc { display: flex; gap: 10px; align-items: flex-start; min-width: 0; }
  .fav {
    background: transparent;
    border: 1px solid var(--line);
    width: 30px; height: 30px;
    border-radius: 50%;
    color: var(--text-mute);
    font-size: 14px; line-height: 1;
    flex-shrink: 0;
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .fav:hover { color: var(--warn); border-color: var(--warn); }
  .fav.on { color: var(--warn); border-color: var(--warn); background: oklch(80% 0.14 70 / 0.10); }

  .city { font-size: 16px; font-weight: 600; letter-spacing: -0.2px; }
  .region { color: var(--text-mute); font-size: 11px; margin-top: 2px; }
  .clock-row { margin-top: 4px; }

  .middle {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: auto;
  }
  .num-wrap {
    display: flex; align-items: flex-start; gap: 4px;
    line-height: 0.85;
  }
  .num {
    font-size: clamp(72px, 9vw, 152px);
    font-weight: 400;
    letter-spacing: -4px;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  .unit { color: var(--text-mute); font-size: 22px; font-weight: 500; padding-top: 8px; }

  .cond { display: flex; align-items: center; gap: 14px; }
  .cond-text { display: flex; flex-direction: column; gap: 4px; }
  .cond-label { font-size: 15px; font-weight: 500; }
  .cond-range {
    color: var(--text-dim);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .cond-range .muted { color: var(--text-mute); display: block; font-size: 10px; margin-top: 2px; }

  .metrics {
    margin: 6px 0 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--line);
    border-radius: 12px;
    overflow: hidden;
  }
  .metrics > div {
    background: oklch(13% 0.018 260 / 0.50);
    padding: 12px 14px;
  }
  dt {
    color: var(--text-mute);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
  }
  dd {
    margin: 4px 0 0;
    font-size: 17px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.3px;
  }
  .u { color: var(--text-mute); font-size: 11px; margin-left: 4px; font-weight: 400; }

  @media (max-width: 720px) {
    .hero { padding: 18px; }
    .metrics { grid-template-columns: repeat(2, 1fr); }
  }
</style>
