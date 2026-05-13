<script lang="ts">
  import { appState, setKeys } from '../lib/state.svelte';

  interface Props { onsave: () => void; }
  const { onsave }: Props = $props();

  let owm  = $state(appState.keys.owm);
  let wapi = $state(appState.keys.wapi);
  let tio  = $state(appState.keys.tio);
  let saved = $state(false);

  // Resync local inputs if appState.keys changes externally (e.g., cleared in another tab).
  $effect(() => { owm  = appState.keys.owm; });
  $effect(() => { wapi = appState.keys.wapi; });
  $effect(() => { tio  = appState.keys.tio; });

  function save() {
    setKeys({ owm: owm.trim(), wapi: wapi.trim(), tio: tio.trim() });
    saved = true;
    onsave();
    setTimeout(() => (saved = false), 1800);
  }
</script>

<details class="advanced card">
  <summary>
    <span>Add paid API keys</span>
    <span class="hint">optional · stored only in your browser</span>
  </summary>
  <p class="lead">
    These slots are wired up but disabled until you paste a key. Keys never
    leave this device — they're saved to <code>localStorage</code> and sent only
    to the matching provider.
  </p>
  <div class="grid">
    <label>
      <span>OpenWeatherMap</span>
      <input type="password" bind:value={owm} placeholder="API key" autocomplete="off" />
    </label>
    <label>
      <span>WeatherAPI.com</span>
      <input type="password" bind:value={wapi} placeholder="API key" autocomplete="off" />
    </label>
    <label>
      <span>Tomorrow.io</span>
      <input type="password" bind:value={tio} placeholder="API key" autocomplete="off" />
    </label>
  </div>
  <div class="actions">
    <button class="btn primary" type="button" onclick={save}>Save &amp; re-fetch</button>
    {#if saved}<span class="saved-msg">✓ Saved</span>{/if}
  </div>
</details>

<style>
  .advanced { padding: 0 18px; }
  summary {
    padding: 14px 0;
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-weight: 500;
    list-style: none;
  }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: "▸"; color: var(--text-mute); font-size: 12px; transition: transform var(--dur) var(--ease); display: inline-block; }
  details[open] summary::before { transform: rotate(90deg); }
  .hint { color: var(--text-mute); font-size: 12px; font-weight: 400; }

  .lead { color: var(--text-dim); font-size: 13px; margin: 0 0 14px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }
  label { display: flex; flex-direction: column; gap: 4px; color: var(--text-dim); font-size: 12px; }
  input {
    background: var(--bg-2);
    color: var(--text);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 8px 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    transition: border-color var(--dur) var(--ease);
  }
  input:focus { outline: none; border-color: var(--accent); }

  .actions {
    margin: 14px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .saved-msg { color: var(--good); font-size: 12px; }

  code {
    background: rgba(255, 255, 255, 0.06);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
  }
</style>
