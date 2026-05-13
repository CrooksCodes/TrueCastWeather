<script lang="ts">
  import { fmtTime } from '../lib/utils/format';
  import { uvInfo } from '../lib/utils/weather';

  interface Props {
    sunrise: string | null;
    sunset: string | null;
    uv: number | null;
  }
  const { sunrise, sunset, uv }: Props = $props();

  // Sun-position progress: 0 at sunrise, 1 at sunset.
  const progress = $derived.by(() => {
    if (!sunrise || !sunset) return null;
    const r = new Date(sunrise).getTime();
    const s = new Date(sunset).getTime();
    const now = Date.now();
    if (now < r) return 0;
    if (now > s) return 1;
    return (now - r) / (s - r);
  });

  const info = $derived(uvInfo(uv));
  const arcW = 240;
  const arcH = 110;
  const r = 100;
  const cx = arcW / 2;
  const cy = arcH;
  // Sun coords on arc
  const sunCoords = $derived.by(() => {
    if (progress == null) return null;
    const angle = Math.PI * progress; // 0..π, 0 = left
    return { x: cx - r * Math.cos(angle), y: cy - r * Math.sin(angle) };
  });
</script>

<div class="card sun fade-in">
  <div class="head">
    <div class="title">Sun &amp; UV</div>
    <div class="badge" style="--tone: {info.color}">UV {uv != null ? Math.round(uv) : '—'} · {info.label}</div>
  </div>

  <div class="arc-wrap">
    <svg viewBox="0 0 {arcW} {arcH + 18}" class="arc" aria-hidden="true">
      <path d="M {cx - r} {cy} A {r} {r} 0 0 1 {cx + r} {cy}"
            fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="3" stroke-linecap="round" />
      {#if progress != null && sunCoords}
        {@const sweep = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${sunCoords.x.toFixed(1)} ${sunCoords.y.toFixed(1)}`}
        <path d={sweep} fill="none" stroke="url(#arc-grad)" stroke-width="3" stroke-linecap="round" />
        <circle cx={sunCoords.x} cy={sunCoords.y} r="8" fill="url(#sun-grad-c)" />
      {/if}
      <defs>
        <linearGradient id="arc-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#ffd166" />
          <stop offset="100%" stop-color="#7cc4ff" />
        </linearGradient>
        <radialGradient id="sun-grad-c">
          <stop offset="0%" stop-color="#ffe69b" />
          <stop offset="100%" stop-color="#ffb43b" />
        </radialGradient>
      </defs>
      <text x={cx - r} y={cy + 16} fill="var(--text-mute)" font-size="10" text-anchor="middle">{fmtTime(sunrise)}</text>
      <text x={cx + r} y={cy + 16} fill="var(--text-mute)" font-size="10" text-anchor="middle">{fmtTime(sunset)}</text>
    </svg>
  </div>

  <div class="times">
    <div><span class="lbl">Sunrise</span><span class="val">{fmtTime(sunrise)}</span></div>
    <div><span class="lbl">Sunset</span> <span class="val">{fmtTime(sunset)}</span></div>
    <div><span class="lbl">UV index</span><span class="val" style="color: {info.color}">{uv != null ? uv.toFixed(1) : '—'}</span></div>
  </div>
</div>

<style>
  .sun { padding: 18px; }
  .head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .title { font-weight: 600; font-size: 14px; }
  .badge {
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
  }
  .arc-wrap { display: grid; place-items: center; margin: 14px 0 8px; }
  .arc { width: 100%; max-width: 280px; height: auto; }

  .times {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 6px;
  }
  .times > div { display: flex; flex-direction: column; gap: 2px; }
  .lbl { color: var(--text-mute); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .val { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>
