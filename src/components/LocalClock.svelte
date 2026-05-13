<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    timezone: string | null;
    abbr?: string | null;
    showAbbr?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }
  const { timezone, abbr = null, showAbbr = true, size = 'md' }: Props = $props();

  let now = $state(new Date());
  let timer: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    timer = setInterval(() => { now = new Date(); }, 1000);
  });
  onDestroy(() => { if (timer) clearInterval(timer); });

  const fmt = $derived.by(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone ?? undefined,
      });
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric', minute: '2-digit', hour12: true,
      });
    }
  });

  const timeStr = $derived(fmt.format(now));
</script>

<span class="clock" data-size={size}>
  <span class="time">{timeStr}</span>
  {#if showAbbr && abbr}
    <span class="tz">{abbr}</span>
  {/if}
</span>

<style>
  .clock {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    font-variant-numeric: tabular-nums;
    color: var(--text-dim);
  }
  .time { font-weight: 500; }
  .tz {
    color: var(--text-mute);
    font-size: 0.78em;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    font-weight: 500;
  }

  .clock[data-size="sm"] { font-size: 11px; }
  .clock[data-size="md"] { font-size: 13px; }
  .clock[data-size="lg"] { font-size: 16px; }
</style>
