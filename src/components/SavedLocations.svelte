<script lang="ts">
  import { appState, setLocation, removeFavorite } from '../lib/state.svelte';
  import type { Location } from '../lib/types';
</script>

{#if appState.favorites.length}
  <div class="saved" aria-label="Saved locations">
    {#each appState.favorites as f (f.lat + ',' + f.lon)}
      <div class="chip" class:active={appState.location && Math.abs(appState.location.lat - f.lat) < 1e-3 && Math.abs(appState.location.lon - f.lon) < 1e-3}>
        <button class="pick" onclick={() => setLocation(f)}>
          <span class="pin">📍</span>
          <span class="text">{f.name}{f.country ? ' · ' + f.country : ''}</span>
        </button>
        <button class="x" onclick={() => removeFavorite(f)} aria-label="Remove {f.name}">×</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .saved {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .chip {
    display: inline-flex;
    align-items: stretch;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    overflow: hidden;
    transition: border-color var(--dur) var(--ease);
  }
  .chip:hover { border-color: var(--line-strong); }
  .chip.active {
    border-color: var(--line-glow);
    background: rgba(124, 196, 255, 0.08);
  }
  .pick {
    background: transparent;
    border: 0;
    color: var(--text);
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .pin { font-size: 12px; }
  .x {
    background: transparent;
    border: 0;
    color: var(--text-mute);
    padding: 6px 10px 6px 4px;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    transition: color var(--dur) var(--ease);
  }
  .x:hover { color: var(--bad); }
</style>
