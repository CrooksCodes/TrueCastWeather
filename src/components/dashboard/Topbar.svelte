<script lang="ts">
  import { appState, setUnit } from '../../lib/state.svelte';

  interface Props {
    section: string;
    /** Opens the mobile navigation drawer (search / saved / settings). */
    onmenu?: () => void;
  }
  const { section, onmenu }: Props = $props();

  const TITLES: Record<string, string> = {
    now: 'Now',
    hourly: 'Hourly',
    daily: '7-day outlook',
    air: 'Air quality',
    sources: 'Sources',
    settings: 'Settings',
  };

  const updatedText = $derived(
    appState.lastUpdated
      ? appState.lastUpdated.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      : '—',
  );
</script>

<div class="bar">
  <div class="left">
    <button class="menu" aria-label="Open menu" onclick={onmenu}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
    <div class="title">{TITLES[section] ?? 'Now'}</div>
    {#if appState.lastUpdated}
      <span class="ts">updated {updatedText}</span>
    {/if}
  </div>
  <div class="right">
    <div class="unit-toggle" role="group" aria-label="Temperature units">
      <button class:active={appState.unit === 'C'} aria-pressed={appState.unit === 'C'} onclick={() => setUnit('C')}>°C</button>
      <button class:active={appState.unit === 'F'} aria-pressed={appState.unit === 'F'} onclick={() => setUnit('F')}>°F</button>
    </div>
  </div>
</div>

<style>
  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 26px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }
  .left { display: flex; align-items: baseline; gap: 12px; }
  .title { font-size: 14px; font-weight: 600; letter-spacing: -0.2px; }
  .menu {
    display: none;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    color: var(--text-dim);
    width: 34px; height: 34px;
    place-items: center;
    align-self: center;
    transition: border-color 200ms, color 200ms;
  }
  .menu:hover { color: var(--accent); border-color: var(--accent); }
  .ts { color: var(--text-mute); font-size: 11px; font-variant-numeric: tabular-nums; }
  .unit-toggle {
    display: inline-flex;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 3px;
  }
  .unit-toggle button {
    background: transparent; border: 0;
    color: var(--text-mute);
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    cursor: pointer;
    transition: color 200ms, background 200ms;
  }
  .unit-toggle button.active {
    background: var(--bg-3);
    color: var(--text);
  }

  @media (max-width: 720px) {
    .bar { padding: 12px 16px; }
    .menu { display: grid; }
  }
</style>
