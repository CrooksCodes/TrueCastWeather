<script lang="ts">
  import type { SourceRow } from '../lib/types';
  import { appState } from '../lib/state.svelte';
  import { fmtTemp, fmtHum, fmtWind, tempSymbol, compassDir } from '../lib/utils/units';

  interface Props {
    rows: SourceRow[];
    topIds: Set<string>;
  }
  const { rows, topIds }: Props = $props();
</script>

<div class="card table-wrap fade-in">
  <table class="sources">
    <thead>
      <tr>
        <th>Source</th>
        <th class="num">Temp</th>
        <th class="num">Feels</th>
        <th class="num">Hum</th>
        <th class="num">Wind</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.src.id)}
        <tr class:top={topIds.has(row.src.id)}>
          <td>
            <div class="src-name">{row.src.name}</div>
            <div class="src-agency">{row.src.agency}</div>
          </td>
          {#if row.ok && row.reading}
            <td class="num">{fmtTemp(row.reading.temp, appState.unit, true)}</td>
            <td class="num">{fmtTemp(row.reading.feels, appState.unit, true)}</td>
            <td class="num">{fmtHum(row.reading.humidity)}</td>
            <td class="num">
              {fmtWind(row.reading.wind, appState.unit)}
              {#if row.reading.windDir != null}<span class="dir">{compassDir(row.reading.windDir)}</span>{/if}
            </td>
            <td class="note">{row.reading.note ?? ''}</td>
          {:else}
            <td class="fail" colspan="5">{row.error ?? 'unavailable'}</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrap { padding: 0; overflow: hidden; }
  table.sources { width: 100%; border-collapse: collapse; }
  table.sources th, table.sources td {
    text-align: left;
    padding: 10px 14px;
    font-size: 13px;
    border-bottom: 1px solid var(--line);
  }
  table.sources th {
    color: var(--text-mute);
    font-weight: 500;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    font-size: 10px;
    background: rgba(255, 255, 255, 0.02);
  }
  table.sources tr:last-child td { border-bottom: 0; }
  table.sources td.num,
  table.sources th.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.fail { color: var(--text-mute); font-style: italic; text-align: center; }
  .src-name { font-weight: 500; }
  .src-agency { color: var(--text-mute); font-size: 11px; margin-top: 1px; }
  .note { color: var(--text-mute); font-size: 12px; }
  .dir { color: var(--text-mute); margin-left: 4px; font-size: 11px; }
  tr.top { background: oklch(85% 0.13 155 / 0.06); }
  tr.top .src-name::before {
    content: "✓ ";
    color: var(--accent-2);
    font-weight: 700;
  }

  @media (max-width: 640px) {
    table.sources th, table.sources td { padding: 8px 10px; font-size: 12px; }
    .src-agency { display: none; }
  }
</style>
