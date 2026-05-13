<script lang="ts">
  import { onDestroy } from 'svelte';
  import { searchLocations, reverseGeocode } from '../lib/api/geocode';
  import type { Location } from '../lib/types';

  interface Props {
    onpick: (loc: Location) => void;
  }
  const { onpick }: Props = $props();

  let q = $state('');
  let suggestions = $state<Location[]>([]);
  let open = $state(false);
  let activeIdx = $state(-1);
  let geoLoading = $state(false);
  let searching = $state(false);
  let lastReq = 0;

  async function refresh(value: string) {
    const myReq = ++lastReq;
    if (!value.trim()) { suggestions = []; open = false; return; }
    searching = true;
    try {
      const res = await searchLocations(value.trim(), 6);
      if (myReq !== lastReq) return; // stale
      suggestions = res;
      open = res.length > 0;
      activeIdx = -1;
    } catch {
      suggestions = [];
      open = false;
    } finally {
      if (myReq === lastReq) searching = false;
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  function handleInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    q = v;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => refresh(v), 220);
  }

  onDestroy(() => { if (debounceTimer) clearTimeout(debounceTimer); });

  function pick(loc: Location) {
    q = '';
    suggestions = [];
    open = false;
    onpick(loc);
  }

  function submit(e: Event) {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      pick(suggestions[activeIdx]);
      return;
    }
    if (suggestions[0]) pick(suggestions[0]);
  }

  function keydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % suggestions.length; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = (activeIdx - 1 + suggestions.length) % suggestions.length; }
    else if (e.key === 'Escape') { open = false; }
  }

  function useGeolocation() {
    if (!navigator.geolocation) return;
    geoLoading = true;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          pick(loc);
        } finally { geoLoading = false; }
      },
      () => { geoLoading = false; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }
</script>

<form class="search" onsubmit={submit} autocomplete="off" role="search">
  <div class="field">
    <svg class="icon-search" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <input
      type="text"
      placeholder="Search a city — e.g. Halifax, Tokyo, 90210…"
      aria-label="City"
      value={q}
      oninput={handleInput}
      onkeydown={keydown}
      onfocus={() => { if (suggestions.length) open = true; }}
      onblur={() => setTimeout(() => (open = false), 180)}
    />
    {#if searching}
      <span class="spin" aria-hidden="true"></span>
    {/if}
  </div>

  <button type="submit" class="btn primary">Search</button>
  <button type="button" class="btn" onclick={useGeolocation} disabled={geoLoading} title="Use my current location">
    {#if geoLoading}
      <span class="spin" aria-hidden="true"></span>
    {:else}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
        <line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" stroke-width="2" />
        <line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" stroke-width="2" />
        <line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="2" />
        <line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" />
      </svg>
    {/if}
    <span class="geo-label">My location</span>
  </button>

  {#if open && suggestions.length}
    <ul class="suggestions" role="listbox">
      {#each suggestions as s, i (s.lat + ',' + s.lon + i)}
        <li>
          <button type="button"
            class:active={i === activeIdx}
            onclick={() => pick(s)}
            onmouseenter={() => (activeIdx = i)}>
            <span class="loc-name">{s.name}</span>
            <span class="loc-sub">
              {s.admin1 ? s.admin1 + ' · ' : ''}{s.country}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</form>

<style>
  .search {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 10px;
    box-shadow: var(--shadow);
    position: relative;
  }
  .field {
    flex: 1 1 280px;
    min-width: 0;
    position: relative;
    display: flex;
    align-items: center;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    padding: 0 12px;
    transition: border-color var(--dur) var(--ease);
  }
  .field:focus-within { border-color: var(--accent); }
  .icon-search { color: var(--text-mute); flex-shrink: 0; }
  .field input {
    flex: 1;
    min-width: 0;
    background: transparent;
    color: var(--text);
    border: 0;
    padding: 12px 10px;
    font-size: 15px;
    outline: none;
  }
  .field input::placeholder { color: var(--text-mute); }
  .geo-label {
    display: inline-block;
  }
  @media (max-width: 480px) {
    .geo-label { display: none; }
  }

  .suggestions {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    list-style: none;
    margin: 0;
    padding: 6px;
    background: var(--bg-1);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    z-index: 30;
    max-height: 320px;
    overflow-y: auto;
  }
  .suggestions li button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    background: transparent;
    border: 0;
    text-align: left;
    color: var(--text);
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--dur) var(--ease);
  }
  .suggestions li button.active,
  .suggestions li button:hover { background: var(--bg-3); }
  .loc-name { font-weight: 500; font-size: 14px; }
  .loc-sub  { color: var(--text-mute); font-size: 12px; }

  .spin {
    width: 14px; height: 14px;
    border: 2px solid var(--line-strong);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
