<script lang="ts">
  import { appState } from '../lib/state.svelte';
  import { fmtTemp } from '../lib/utils/units';

  interface Props {
    score: number;       // 0..1
    spread: number;      // celsius
    count: number;
  }
  const { score, spread, count }: Props = $props();

  const label = $derived(
    score < 0.2 ? 'Strong agreement' :
    score < 0.45 ? 'Mostly agree' :
    score < 0.7 ? 'Some divergence' :
    'High divergence',
  );

  const tone = $derived(
    score < 0.2 ? 'good' :
    score < 0.45 ? 'ok' :
    score < 0.7 ? 'warn' :
    'bad',
  );
</script>

<div class="badge {tone}" title="Spread = max − min temperature across {count} sources">
  <div class="dot"></div>
  <div class="text">
    <div class="label">{label}</div>
    <div class="sub">spread {fmtTemp(spread, appState.unit, true)} · {count} sources</div>
  </div>
  <div class="meter" aria-hidden="true">
    <div class="fill" style="width: {Math.round(score * 100)}%"></div>
  </div>
</div>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--radius-pill);
    background: var(--bg-1);
    border: 1px solid var(--line);
    transition: border-color var(--dur) var(--ease);
  }
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--text-mute);
    box-shadow: 0 0 12px currentColor;
  }
  .badge.good .dot, .badge.good .fill { background: var(--good); color: var(--good); }
  .badge.ok   .dot, .badge.ok   .fill { background: var(--accent); color: var(--accent); }
  .badge.warn .dot, .badge.warn .fill { background: var(--warn); color: var(--warn); }
  .badge.bad  .dot, .badge.bad  .fill { background: var(--bad); color: var(--bad); }

  .text { display: flex; flex-direction: column; line-height: 1.2; }
  .label { font-size: 13px; font-weight: 600; }
  .sub   { font-size: 11px; color: var(--text-mute); margin-top: 2px; }

  .meter {
    width: 80px;
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--text-mute);
    border-radius: 999px;
    transition: width 0.6s var(--ease);
  }
</style>
