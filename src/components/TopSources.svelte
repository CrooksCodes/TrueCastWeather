<script lang="ts">
  import type { ConsensusSummary, SourceRow } from '../lib/types';
  import { appState } from '../lib/state.svelte';
  import { fmtTemp, fmtHum, fmtWind, tempSymbol, cToF } from '../lib/utils/units';

  interface Props {
    rows: SourceRow[];
    summary: ConsensusSummary;
  }
  const { rows, summary }: Props = $props();
</script>

<div class="grid">
  {#each rows as row, i (row.src.id)}
    {@const r = row.reading!}
    {@const dC = (r.temp ?? 0) - summary.temp}
    {@const dShown = appState.unit === 'F' ? dC * 1.8 : dC}
    {@const sign = dShown >= 0 ? '+' : '−'}
    <article class="card src">
      <div class="rank">#{i + 1}</div>
      <div class="name">{row.src.name}</div>
      <div class="agency">{row.src.agency}</div>
      <div class="row">
        <div class="t">{fmtTemp(r.temp, appState.unit, false)}<span class="u">{tempSymbol(appState.unit)}</span></div>
        <div class="delta" class:hot={dC > 0.05} class:cold={dC < -0.05}>
          {sign}{Math.abs(dShown).toFixed(1)}° vs avg
        </div>
      </div>
      <div class="stats">
        <span>Feels <b>{fmtTemp(r.feels, appState.unit, true)}</b></span>
        <span>Hum <b>{fmtHum(r.humidity)}</b></span>
        <span>Wind <b>{fmtWind(r.wind, appState.unit)}</b></span>
      </div>
    </article>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
  }
  .src {
    padding: 18px;
    position: relative;
    border-color: rgba(154, 230, 180, 0.25);
    box-shadow: 0 0 0 1px rgba(154, 230, 180, 0.06) inset, var(--shadow-sm);
    transition: transform var(--dur) var(--ease), border-color var(--dur) var(--ease);
  }
  .src:hover {
    transform: translateY(-2px);
    border-color: rgba(154, 230, 180, 0.45);
  }
  .rank {
    position: absolute;
    top: 12px; right: 12px;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(154, 230, 180, 0.15);
    color: var(--accent-2);
    display: grid; place-items: center;
    font-size: 12px; font-weight: 700;
    letter-spacing: -0.5px;
  }
  .name { font-weight: 600; font-size: 15px; padding-right: 36px; }
  .agency { color: var(--text-mute); font-size: 12px; margin-top: 2px; }
  .row {
    margin-top: 16px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .t {
    font-size: 36px;
    font-weight: 500;
    letter-spacing: -1.2px;
    color: var(--text);
    font-feature-settings: "tnum";
  }
  .t .u { font-size: 16px; color: var(--text-dim); margin-left: 2px; }
  .delta { font-size: 11px; color: var(--text-mute); white-space: nowrap; }
  .delta.hot  { color: var(--warn); }
  .delta.cold { color: var(--accent); }

  .stats {
    margin-top: 12px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    color: var(--text-dim);
    font-size: 12px;
  }
  .stats b { color: var(--text); font-weight: 600; }
</style>
