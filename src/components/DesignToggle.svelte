<script lang="ts">
  import { designState, setDesign } from '../lib/design.svelte';
</script>

<div class="toggle" role="group" aria-label="Compare designs">
  <button
    class:active={designState.design === 'a'}
    aria-pressed={designState.design === 'a'}
    onclick={() => setDesign('a')}
  >
    <span class="key">A</span>
    <span class="name">Dashboard</span>
  </button>
  <button
    class:active={designState.design === 'b'}
    aria-pressed={designState.design === 'b'}
    onclick={() => setDesign('b')}
  >
    <span class="key">B</span>
    <span class="name">Editorial</span>
  </button>
</div>

<style>
  .toggle {
    position: fixed;
    bottom: 18px;
    right: 18px;
    z-index: 100;
    display: inline-flex;
    background: oklch(13% 0.018 260 / 0.85);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-pill);
    padding: 4px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  button {
    background: transparent;
    border: 0;
    color: var(--text-mute);
    padding: 7px 14px 7px 9px;
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 200ms cubic-bezier(0.16, 1, 0.3, 1),
                background 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  button:hover { color: var(--text); }
  button.active {
    background: var(--text);
    color: var(--bg-0);
  }
  .key {
    width: 22px; height: 22px;
    border-radius: 50%;
    display: grid; place-items: center;
    font-weight: 700;
    font-size: 11px;
    background: oklch(100% 0 0 / 0.08);
    color: inherit;
  }
  button.active .key {
    background: oklch(13% 0.018 260);
    color: var(--text);
  }

  @media (max-width: 540px) {
    .toggle { bottom: 12px; right: 12px; padding: 3px; }
    .name { display: none; }
    button { padding: 6px; }
  }
</style>
