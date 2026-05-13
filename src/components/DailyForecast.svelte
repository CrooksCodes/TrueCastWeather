<script lang="ts">
  import type { DailyPoint } from '../lib/types';
  import { appState } from '../lib/state.svelte';
  import { cToF, fmtTempInt } from '../lib/utils/units';
  import { fmtDay, isToday } from '../lib/utils/format';
  import { weatherInfo } from '../lib/utils/weather';
  import WeatherIcon from './WeatherIcon.svelte';

  interface Props { days: DailyPoint[]; }
  const { days }: Props = $props();

  const conv = (c: number | null) => c == null ? null : (appState.unit === 'F' ? cToF(c)! : c);

  const range = $derived.by(() => {
    const lows: number[] = [];
    const highs: number[] = [];
    for (const d of days) {
      const lo = conv(d.lo);
      const hi = conv(d.hi);
      if (lo != null) lows.push(lo);
      if (hi != null) highs.push(hi);
    }
    return { min: Math.min(...lows), max: Math.max(...highs) };
  });

  function pos(t: number | null): number {
    if (t == null) return 0;
    const span = Math.max(0.0001, range.max - range.min);
    return ((t - range.min) / span) * 100;
  }
</script>

<div class="daily card fade-in">
  {#each days as d, i (d.date)}
    {@const wx = weatherInfo(d.weatherCode, true)}
    {@const lo = conv(d.lo)}
    {@const hi = conv(d.hi)}
    {@const left = pos(lo)}
    {@const right = pos(hi)}
    <div class="row">
      <div class="day">{isToday(d.date) ? 'Today' : fmtDay(d.date)}</div>
      <div class="ic" title={wx.label}>
        <WeatherIcon kind={wx.icon} size={32} />
      </div>
      <div class="precip" title="Chance of precipitation">
        {#if d.precipProb && d.precipProb > 5}
          <span class="prec-icon">💧</span>
          <span class="prec-num">{Math.round(d.precipProb)}%</span>
        {:else}
          <span class="prec-blank"></span>
        {/if}
      </div>
      <div class="lo">{fmtTempInt(d.lo, appState.unit, false)}°</div>
      <div class="bar-wrap">
        <div class="bar-bg">
          <div
            class="bar-fill"
            style="left: {left}%; right: {100 - right}%;"
          ></div>
        </div>
      </div>
      <div class="hi">{fmtTempInt(d.hi, appState.unit, false)}°</div>
    </div>
    {#if i < days.length - 1}<div class="sep"></div>{/if}
  {/each}
</div>

<style>
  .daily { padding: 12px 18px; }
  .row {
    display: grid;
    grid-template-columns: 60px 36px 60px 38px 1fr 38px;
    gap: 10px;
    align-items: center;
    padding: 8px 0;
  }
  .sep { height: 1px; background: var(--line); margin: 0; }
  .day { font-weight: 500; font-size: 14px; }
  .ic { display: grid; place-items: center; }
  .precip {
    color: var(--accent);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 3px;
    min-width: 0;
  }
  .prec-blank { display: inline-block; width: 1px; }
  .lo { color: var(--text-mute); text-align: right; font-variant-numeric: tabular-nums; font-size: 14px; }
  .hi { color: var(--text); text-align: left; font-variant-numeric: tabular-nums; font-size: 14px; font-weight: 500; }
  .bar-wrap { padding: 0 4px; }
  .bar-bg {
    position: relative;
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    overflow: hidden;
  }
  .bar-fill {
    position: absolute;
    top: 0; bottom: 0;
    background: linear-gradient(90deg, #7cc4ff, #ffd166, #ff7a7a);
    border-radius: 999px;
    transition: left 0.5s var(--ease), right 0.5s var(--ease);
  }

  @media (max-width: 560px) {
    .row {
      grid-template-columns: 50px 28px 48px 32px 1fr 32px;
      gap: 6px;
    }
    .day { font-size: 13px; }
  }
</style>
