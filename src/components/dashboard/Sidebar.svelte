<script lang="ts">
  import { appState, setLocation, removeFavorite } from '../../lib/state.svelte';
  import { searchLocations, reverseGeocode } from '../../lib/api/geocode';
  import { quickTemp } from '../../lib/api/quickTemp';
  import { fmtTempInt } from '../../lib/utils/units';
  import type { Location } from '../../lib/types';

  interface Props {
    section: string;
    onsection: (s: string) => void;
    /** Fired after the user picks a location — lets the mobile drawer close itself. */
    onnavigate?: () => void;
  }
  const { section, onsection, onnavigate }: Props = $props();

  const NAV = [
    { id: 'now',     label: 'Now',     icon: '◐' },
    { id: 'hourly',  label: 'Hourly',  icon: '◊' },
    { id: 'daily',   label: '7-day',   icon: '◇' },
    { id: 'air',     label: 'Air',     icon: '○' },
    { id: 'sources', label: 'Sources', icon: '≡' },
    { id: 'settings',label: 'Settings',icon: '∗' },
  ];

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
        suggestions = res;
        open = !!res.length;
        active = -1;
      } catch { suggestions = []; open = false; }
    }, 220);
  }

  function pick(loc: Location) {
    q = ''; suggestions = []; open = false;
    setLocation(loc);
    onnavigate?.();
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

  // Mini-temp cache keyed by lat,lon. Refreshed when favorites change.
  let tempCache = $state<Record<string, number | null>>({});
  const keyFor = (l: Location) => `${l.lat.toFixed(3)},${l.lon.toFixed(3)}`;

  $effect(() => {
    const favs = appState.favorites;
    favs.forEach(async (f) => {
      const k = keyFor(f);
      if (k in tempCache) return;
      tempCache = { ...tempCache, [k]: null }; // reserve
      const t = await quickTemp(f.lat, f.lon);
      tempCache = { ...tempCache, [k]: t };
    });
  });

  const sameLoc = (a: Location, b: Location) =>
    Math.abs(a.lat - b.lat) < 1e-3 && Math.abs(a.lon - b.lon) < 1e-3;
</script>

<aside class="sb">
  <div class="brand">
    <div class="logo" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="13" r="5" fill="oklch(82% 0.14 80)" />
        <path d="M9 22c-3 0-5 2-5 4.5h22c2.2 0 4-1.8 4-4s-1.8-4-4-4c-.6 0-1.2.1-1.7.3-1-2.6-3.6-4.3-6.5-4.3-3.9 0-7 3.1-7 7 0 .2 0 .3.1.5Z"
              fill="oklch(72% 0.04 250)" />
      </svg>
    </div>
    <div class="title">
      <div class="name">Truecast</div>
      <div class="sub">the forecast, narrowed</div>
    </div>
  </div>

  <form class="search" onsubmit={submit} autocomplete="off" role="search">
    <div class="field">
      <svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Search city"
        aria-label="City"
        bind:value={q}
        oninput={(e) => refresh((e.target as HTMLInputElement).value)}
        onkeydown={keydown}
        onfocus={() => { if (suggestions.length) open = true; }}
        onblur={() => setTimeout(() => (open = false), 180)}
      />
    </div>
    <button type="button" class="geo" onclick={useGeo} disabled={geoBusy} title="Use my location">
      {#if geoBusy}<span class="spin"></span>{:else}◉{/if}
    </button>

    {#if open && suggestions.length}
      <ul class="suggest" role="listbox">
        {#each suggestions as s, i (keyFor(s) + i)}
          <li>
            <button type="button"
              class:active={i === active}
              onclick={() => pick(s)}
              onmouseenter={() => (active = i)}>
              <span class="lbl">{s.name}</span>
              <span class="lsub">{s.admin1 ? s.admin1 + ' · ' : ''}{s.country}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </form>

  <div class="rail-wrap">
    <div class="rail-head">Saved</div>
    {#if appState.favorites.length === 0}
      <div class="rail-empty">Star a location to pin it here.</div>
    {:else}
      <ul class="rail">
        {#each appState.favorites as f (keyFor(f))}
          {@const t = tempCache[keyFor(f)]}
          {@const isCur = appState.location ? sameLoc(appState.location, f) : false}
          <li class:current={isCur}>
            <button class="rail-pick" onclick={() => { setLocation(f); onnavigate?.(); }}>
              <span class="rail-name">
                <span class="rail-text">{f.name}</span>
                <span class="rail-country">{f.country}</span>
              </span>
              <span class="rail-temp">
                {#if t == null}<span class="dotty">…</span>{:else}{fmtTempInt(t, appState.unit, true)}{/if}
              </span>
            </button>
            <button class="rail-x" onclick={() => removeFavorite(f)} aria-label="Remove">×</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <nav class="nav" aria-label="Sections">
    {#each NAV as item (item.id)}
      <button
        class="nav-item"
        class:active={section === item.id}
        onclick={() => onsection(item.id)}
      >
        <span class="nav-icon" aria-hidden="true">{item.icon}</span>
        <span class="nav-label">{item.label}</span>
      </button>
    {/each}
  </nav>

  <div class="foot">
    <span>jeremycrooks.ca</span>
    <span class="dot">·</span>
    <span>open-meteo</span>
  </div>
</aside>

<style>
  .sb {
    position: relative;
    z-index: 2;
    width: 260px;
    height: 100vh;
    padding: 22px 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    background: oklch(13% 0.018 260 / 0.62);
    border-right: 1px solid var(--line);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
  }

  .brand { display: flex; align-items: center; gap: 10px; }
  .logo {
    width: 36px; height: 36px;
    display: grid; place-items: center;
    background: linear-gradient(140deg, var(--bg-3), var(--bg-1));
    border: 1px solid var(--line-strong);
    border-radius: 11px;
  }
  .name { font-size: 15px; font-weight: 600; letter-spacing: -0.2px; }
  .sub { font-size: 11px; color: var(--text-mute); margin-top: 1px; }

  .search { position: relative; display: flex; gap: 6px; }
  .field {
    flex: 1; min-width: 0;
    display: flex; align-items: center; gap: 6px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 0 10px;
    transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .field:focus-within { border-color: var(--accent); }
  .ic { color: var(--text-mute); flex-shrink: 0; }
  .field input {
    flex: 1; min-width: 0;
    background: transparent; color: var(--text);
    border: 0; padding: 8px 0;
    font-size: 13px; outline: none;
  }
  .geo {
    width: 34px; height: 34px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 10px;
    color: var(--text-dim);
    font-size: 14px;
    display: grid; place-items: center;
    cursor: pointer;
    transition: border-color 200ms, color 200ms;
  }
  .geo:hover { color: var(--accent); border-color: var(--accent); }
  .spin {
    width: 12px; height: 12px;
    border: 2px solid var(--line-strong);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .suggest {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    list-style: none; margin: 0; padding: 6px;
    background: oklch(15% 0.020 260 / 0.96);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    box-shadow: var(--shadow);
    z-index: 30;
    max-height: 280px; overflow-y: auto;
  }
  .suggest li button {
    display: flex; flex-direction: column; align-items: flex-start;
    width: 100%; gap: 1px;
    background: transparent; border: 0; text-align: left;
    color: var(--text); padding: 7px 10px;
    border-radius: 8px; cursor: pointer;
    font-size: 12px;
  }
  .suggest li button.active,
  .suggest li button:hover { background: var(--bg-3); }
  .lbl { font-weight: 500; }
  .lsub { color: var(--text-mute); font-size: 11px; }

  .rail-wrap {
    display: flex; flex-direction: column; gap: 6px;
    flex-shrink: 0;
  }
  .rail-head {
    font-size: 10px; font-weight: 600;
    color: var(--text-mute);
    letter-spacing: 1.4px; text-transform: uppercase;
    padding: 0 4px;
  }
  .rail {
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 2px;
    max-height: 220px; overflow-y: auto;
  }
  .rail-empty {
    color: var(--text-mute); font-size: 11px;
    padding: 8px 4px; line-height: 1.4;
  }
  .rail li {
    display: flex; align-items: stretch;
    border-radius: 9px;
    transition: background 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .rail li:hover { background: oklch(100% 0 0 / 0.04); }
  .rail li.current { background: oklch(78% 0.13 240 / 0.10); }
  .rail-pick {
    flex: 1; min-width: 0;
    display: flex; justify-content: space-between; align-items: center;
    gap: 8px;
    background: transparent; border: 0;
    padding: 7px 9px;
    color: var(--text); cursor: pointer;
    font-size: 12px; text-align: left;
  }
  .rail-name {
    display: flex; flex-direction: column; min-width: 0;
    line-height: 1.2;
  }
  .rail-text {
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-weight: 500;
  }
  .rail-country { color: var(--text-mute); font-size: 10px; }
  .rail-temp {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    color: var(--text-dim);
    flex-shrink: 0;
  }
  .rail li.current .rail-temp { color: var(--accent); }
  .dotty { color: var(--text-mute); }
  .rail-x {
    background: transparent; border: 0;
    color: var(--text-mute); font-size: 14px;
    padding: 0 8px; cursor: pointer;
    opacity: 0;
    transition: opacity 200ms, color 200ms;
  }
  .rail li:hover .rail-x { opacity: 1; }
  .rail-x:hover { color: var(--bad); }

  .nav {
    display: flex; flex-direction: column; gap: 1px;
    margin-top: auto;
  }
  .nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 8px 10px;
    background: transparent; border: 0;
    color: var(--text-dim);
    border-radius: 9px;
    font-size: 13px; font-weight: 500;
    cursor: pointer; text-align: left;
    transition: background 200ms, color 200ms;
  }
  .nav-item:hover { background: oklch(100% 0 0 / 0.04); color: var(--text); }
  .nav-item.active {
    background: oklch(100% 0 0 / 0.06);
    color: var(--text);
  }
  .nav-item.active .nav-icon { color: var(--accent); }
  .nav-icon {
    width: 18px; text-align: center;
    color: var(--text-mute);
    font-size: 14px;
  }

  .foot {
    color: var(--text-mute);
    font-size: 10px;
    padding: 0 4px;
    display: flex; gap: 6px; align-items: center;
  }
  .dot { opacity: 0.5; }
</style>
