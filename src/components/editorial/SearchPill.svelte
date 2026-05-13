<script lang="ts">
  import { onDestroy } from 'svelte';
  import { searchLocations, reverseGeocode } from '../../lib/api/geocode';
  import { setLocation, appState, setUnit } from '../../lib/state.svelte';
  import type { Location } from '../../lib/types';

  let q = $state('');
  let suggestions = $state<Location[]>([]);
  let open = $state(false);
  let active = $state(-1);
  let geoBusy = $state(false);
  let lastReq = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function refresh(v: string) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      const my = ++lastReq;
      if (!v.trim()) { suggestions = []; open = false; return; }
      try {
        const res = await searchLocations(v.trim(), 6);
        if (my !== lastReq) return;
        suggestions = res; open = !!res.length; active = -1;
      } catch { suggestions = []; open = false; }
    }, 220);
  }

  onDestroy(() => { if (timer) clearTimeout(timer); });

  function pick(loc: Location) {
    q = ''; suggestions = []; open = false;
    setLocation(loc);
  }

  function submit(e: Event) {
    e.preventDefault();
    if (active >= 0 && suggestions[active]) pick(suggestions[active]);
    else if (suggestions[0]) pick(suggestions[0]);
  }

  function keydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % suggestions.length; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + suggestions.length) % suggestions.length; }
    else if (e.key === 'Escape') { open = false; }
  }

  function useGeo() {
    if (!navigator.geolocation) return;
    geoBusy = true;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          pick(loc);
        } finally { geoBusy = false; }
      },
      () => { geoBusy = false; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }
</script>

<div class="pill-wrap">
  <form class="pill" onsubmit={submit} role="search" autocomplete="off">
    <button type="button" class="ic" onclick={useGeo} disabled={geoBusy} title="Use my location">
      {#if geoBusy}
        <span class="spin"></span>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
          <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" stroke-width="1.6" />
          <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" stroke-width="1.6" />
          <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="1.6" />
          <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="1.6" />
        </svg>
      {/if}
    </button>
    <input
      type="text"
      placeholder="Halifax, Tokyo, 90210…"
      aria-label="City"
      bind:value={q}
      oninput={(e) => refresh((e.target as HTMLInputElement).value)}
      onkeydown={keydown}
      onfocus={() => { if (suggestions.length) open = true; }}
      onblur={() => setTimeout(() => (open = false), 180)}
    />
    <div class="div"></div>
    <div class="unit-mini" role="group" aria-label="Temperature units">
      <button type="button" class:active={appState.unit === 'C'} onclick={() => setUnit('C')}>°C</button>
      <button type="button" class:active={appState.unit === 'F'} onclick={() => setUnit('F')}>°F</button>
    </div>
  </form>

  {#if open && suggestions.length}
    <ul class="suggest" role="listbox">
      {#each suggestions as s, i (s.lat + ',' + s.lon + i)}
        <li>
          <button type="button"
            class:active={i === active}
            onclick={() => pick(s)}
            onmouseenter={() => (active = i)}>
            <span class="lbl">{s.name}</span>
            <span class="sub">{s.admin1 ? s.admin1 + ' · ' : ''}{s.country}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .pill-wrap {
    position: fixed;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    width: min(560px, calc(100vw - 32px));
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: oklch(13% 0.018 260 / 0.55);
    border: 1px solid oklch(100% 0 0 / 0.12);
    border-radius: 999px;
    padding: 6px 6px 6px 12px;
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    box-shadow: 0 12px 40px oklch(0% 0 0 / 0.35);
    transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
                background 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .pill:focus-within {
    border-color: oklch(100% 0 0 / 0.25);
    background: oklch(13% 0.018 260 / 0.7);
  }
  .ic {
    background: transparent; border: 0;
    color: var(--text-dim);
    width: 32px; height: 32px;
    border-radius: 50%;
    display: grid; place-items: center;
    cursor: pointer;
    transition: color 200ms, background 200ms;
  }
  .ic:hover { color: var(--text); background: oklch(100% 0 0 / 0.08); }
  .ic:disabled { opacity: 0.5; cursor: not-allowed; }
  input {
    flex: 1;
    background: transparent; border: 0;
    color: var(--text);
    font-size: 14px;
    padding: 8px 4px;
    outline: none;
    min-width: 0;
  }
  input::placeholder { color: var(--text-mute); }
  .div { width: 1px; height: 22px; background: var(--line); margin: 0 4px; }
  .unit-mini {
    display: inline-flex;
    background: oklch(100% 0 0 / 0.05);
    border-radius: 999px;
    padding: 2px;
  }
  .unit-mini button {
    background: transparent; border: 0;
    color: var(--text-mute);
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: background 200ms, color 200ms;
  }
  .unit-mini button.active {
    background: var(--text);
    color: var(--bg-0);
  }
  .spin {
    width: 12px; height: 12px;
    border: 2px solid var(--line-strong);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .suggest {
    margin: 8px 0 0;
    padding: 6px;
    list-style: none;
    background: oklch(15% 0.020 260 / 0.92);
    border: 1px solid var(--line-strong);
    border-radius: 18px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    max-height: 280px;
    overflow-y: auto;
  }
  .suggest li button {
    display: flex; flex-direction: column; align-items: flex-start;
    width: 100%; gap: 1px;
    background: transparent; border: 0; text-align: left;
    color: var(--text); padding: 8px 12px;
    border-radius: 11px; cursor: pointer;
    font-size: 13px;
  }
  .suggest li button.active,
  .suggest li button:hover { background: oklch(100% 0 0 / 0.06); }
  .lbl { font-weight: 500; }
  .sub { color: var(--text-mute); font-size: 11px; }
</style>
