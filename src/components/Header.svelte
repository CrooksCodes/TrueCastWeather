<script lang="ts">
  import { appState, setUnit } from '../lib/state.svelte';
</script>

<header class="top">
  <div class="brand">
    <div class="logo">
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="13" r="5" fill="url(#hg-sun)" />
        <path d="M9 22c-3 0-5 2-5 4.5h22c2.2 0 4-1.8 4-4s-1.8-4-4-4c-.6 0-1.2.1-1.7.3-1-2.6-3.6-4.3-6.5-4.3-3.9 0-7 3.1-7 7 0 .2 0 .3.1.5Z"
              fill="url(#hg-c)" />
        <defs>
          <radialGradient id="hg-sun"><stop offset="0%" stop-color="#ffe69b"/><stop offset="100%" stop-color="#ffb43b"/></radialGradient>
          <linearGradient id="hg-c" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#dbe4f7"/><stop offset="100%" stop-color="#7c8eb3"/></linearGradient>
        </defs>
      </svg>
    </div>
    <div class="title">
      <div class="name">Truecast</div>
      <div class="sub">the forecast, narrowed</div>
    </div>
  </div>

  <div class="unit-toggle" role="group" aria-label="Temperature units">
    <button
      class:active={appState.unit === 'C'}
      aria-pressed={appState.unit === 'C'}
      onclick={() => setUnit('C')}
    >°C</button>
    <button
      class:active={appState.unit === 'F'}
      aria-pressed={appState.unit === 'F'}
      onclick={() => setUnit('F')}
    >°F</button>
  </div>
</header>

<style>
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo {
    width: 40px; height: 40px;
    display: grid; place-items: center;
    background: linear-gradient(135deg, #1f2a44, #0c1322);
    border: 1px solid var(--line-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
  }
  .name { font-weight: 600; letter-spacing: 0.2px; font-size: 16px; }
  .sub  { color: var(--text-mute); font-size: 12px; margin-top: 2px; }

  .unit-toggle {
    display: inline-flex;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    padding: 4px;
    box-shadow: var(--shadow-sm);
  }
  .unit-toggle button {
    background: transparent;
    border: 0;
    color: var(--text-dim);
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all var(--dur) var(--ease);
  }
  .unit-toggle button.active {
    background: linear-gradient(180deg, #2a3654, #1c2540);
    color: var(--text);
    box-shadow: inset 0 0 0 1px var(--line-strong);
  }

  @media (max-width: 480px) {
    .sub { display: none; }
  }
</style>
