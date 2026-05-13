<script lang="ts">
  import type { AirQuality } from '../lib/types';
  import { aqiInfo } from '../lib/utils/weather';

  interface Props { air: AirQuality | null; }
  const { air }: Props = $props();

  const info = $derived(aqiInfo(air?.aqi ?? null));
  const fillPct = $derived(Math.min(100, ((air?.aqi ?? 0) / 100) * 100));
  const fmt = (v: number | null | undefined) =>
    v == null ? '—' : Math.round(v).toString();
</script>

<div class="card aqi fade-in">
  <div class="head">
    <div class="title">Air quality</div>
    <div class="badge" style="--tone: {info.color}">{info.label}</div>
  </div>

  {#if air?.aqi != null}
    <div class="aqi-num" style="color: {info.color}">
      {Math.round(air.aqi)}
      <span class="aqi-sub">European AQI</span>
    </div>
    <div class="meter" aria-hidden="true">
      <div class="fill" style="width: {fillPct}%; background: {info.color}"></div>
    </div>

    <div class="pollutants">
      <div><span class="lbl">PM2.5</span><span class="val">{fmt(air.pm25)}<small>µg/m³</small></span></div>
      <div><span class="lbl">PM10</span> <span class="val">{fmt(air.pm10)}<small>µg/m³</small></span></div>
      <div><span class="lbl">O₃</span>   <span class="val">{fmt(air.o3)}<small>µg/m³</small></span></div>
      <div><span class="lbl">NO₂</span>  <span class="val">{fmt(air.no2)}<small>µg/m³</small></span></div>
      <div><span class="lbl">SO₂</span>  <span class="val">{fmt(air.so2)}<small>µg/m³</small></span></div>
    </div>
  {:else}
    <div class="empty">Air quality data unavailable for this location.</div>
  {/if}
</div>

<style>
  .aqi { padding: 18px; }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .title { font-weight: 600; font-size: 14px; }
  .badge {
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .aqi-num {
    margin-top: 14px;
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
  }
  .aqi-sub { color: var(--text-mute); font-size: 11px; font-weight: 400; margin-left: 8px; vertical-align: 8px; letter-spacing: 0; }
  .meter {
    margin-top: 14px;
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    overflow: hidden;
  }
  .fill { height: 100%; transition: width 0.6s var(--ease); }

  .pollutants {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 10px;
  }
  .pollutants > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }
  .lbl { color: var(--text-mute); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .val { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .val small { color: var(--text-mute); font-size: 9px; font-weight: 400; margin-left: 3px; }
  .empty { color: var(--text-mute); font-size: 13px; padding: 18px 0; text-align: center; }
</style>
