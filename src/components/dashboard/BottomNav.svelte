<script lang="ts">
  interface Props {
    section: string;
    onsection: (s: string) => void;
  }
  const { section, onsection }: Props = $props();

  const NAV = [
    { id: 'now',     label: 'Now',     icon: '◐' },
    { id: 'hourly',  label: 'Hourly',  icon: '◊' },
    { id: 'daily',   label: '7-day',   icon: '◇' },
    { id: 'air',     label: 'Air',     icon: '○' },
    { id: 'sources', label: 'Sources', icon: '≡' },
  ];
</script>

<nav class="bn" aria-label="Sections">
  {#each NAV as item (item.id)}
    <button
      class:active={section === item.id}
      onclick={() => onsection(item.id)}
    >
      <span class="ic" aria-hidden="true">{item.icon}</span>
      <span class="lbl">{item.label}</span>
    </button>
  {/each}
</nav>

<style>
  .bn {
    position: sticky;
    bottom: 0;
    z-index: 5;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    background: oklch(13% 0.018 260 / 0.92);
    border-top: 1px solid var(--line);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
  }
  button {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    background: transparent; border: 0;
    color: var(--text-mute);
    padding: 8px 4px;
    border-radius: 8px;
    cursor: pointer;
    transition: color 200ms;
  }
  button.active { color: var(--accent); }
  .ic { font-size: 16px; }
  .lbl { font-size: 10px; font-weight: 500; letter-spacing: 0.3px; }
</style>
