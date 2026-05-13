<script lang="ts">
  import { appState, setUnit } from '../../lib/state.svelte';

  interface Props {
    section: string;
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
    <button class="menu-btn" onclick={onmenu} aria-label="Open menu and search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
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
    gap: 10px;
    padding: 14px 26px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
    min-width: 0;
  }
  .left { min-width: 0; flex: 1; }
  .right { flex-shrink: 0; }
  .title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  @media (max-width: 720px) {
    .bar { padding: 12px 14px; }
    .ts { display: none; }
  }
  .left { display: flex; align-items: center; gap: 12px; }
  .menu-btn {
    display: none;
    width: 34px; height: 34px;
    align-items: center; justify-content: center;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color 200ms, color 200ms;
  }
  .menu-btn:hover { border-color: var(--accent); color: var(--accent); }
  @media (max-width: 720px) {
    .menu-btn { display: inline-flex; }
  }
  .title { font-size: 14px; font-weight: 600; letter-spacing: -0.2px; }
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
</style>
