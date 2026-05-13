<script lang="ts">
  import type { HourlyData } from '../lib/types';
  import { appState } from '../lib/state.svelte';
  import { cToF, tempSymbol } from '../lib/utils/units';
  import { fmtHour } from '../lib/utils/format';
  import { weatherInfo } from '../lib/utils/weather';
  import WeatherIcon from './WeatherIcon.svelte';

  interface Props { hourly: HourlyData; }
  const { hourly }: Props = $props();

  const W = 800;
  const H = 220;
  const padX = 28;
  const padTop = 28;
  const padBottom = 56;

  const conv = (c: number) => appState.unit === 'F' ? cToF(c)! : c;

  const points = $derived(hourly.points.filter((p) => p.temp != null));
  const bands = $derived(hourly.bands);

  const range = $derived.by(() => {
    if (!points.length) return { min: 0, max: 1 };
    const all: number[] = [];
    for (const p of points) all.push(conv(p.temp as number));
    if (bands) for (const b of bands) {
      if (!Number.isNaN(b.min)) all.push(conv(b.min));
      if (!Number.isNaN(b.max)) all.push(conv(b.max));
    }
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = Math.max(1, (max - min) * 0.15);
    return { min: min - pad, max: max + pad };
  });

  const x = (i: number) => padX + (i / Math.max(1, points.length - 1)) * (W - 2 * padX);
  const y = (val: number) => {
    const { min, max } = range;
    const t = (val - min) / Math.max(0.0001, max - min);
    return padTop + (1 - t) * (H - padTop - padBottom);
  };

  const linePath = $derived.by(() => {
    if (!points.length) return '';
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(conv(p.temp as number)).toFixed(1)}`)
      .join(' ');
  });

  const areaPath = $derived.by(() => {
    if (!points.length) return '';
    const top = points.map((p, i) => `L ${x(i).toFixed(1)} ${y(conv(p.temp as number)).toFixed(1)}`).join(' ');
    const baseline = (H - padBottom).toFixed(1);
    return `M ${x(0).toFixed(1)} ${baseline} ${top.replace(/^L/, 'L')} L ${x(points.length - 1).toFixed(1)} ${baseline} Z`;
  });

  const bandPath = $derived.by(() => {
    if (!bands || !points.length) return '';
    const top: string[] = [];
    const bot: string[] = [];
    for (let i = 0; i < points.length; i++) {
      const b = bands[i];
      if (!b || Number.isNaN(b.min) || Number.isNaN(b.max)) continue;
      top.push(`${top.length === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(conv(b.max)).toFixed(1)}`);
      bot.unshift(`L ${x(i).toFixed(1)} ${y(conv(b.min)).toFixed(1)}`);
    }
    return [...top, ...bot, 'Z'].join(' ');
  });

  // X-axis ticks: every 3 hours
  const ticks = $derived(points.map((_, i) => i).filter((i) => i % 3 === 0));

  // Hover state
  let hoverIdx = $state<number | null>(null);
  let svgEl: SVGSVGElement;
  function handleMove(e: PointerEvent) {
    if (!svgEl || !points.length) return;
    const rect = svgEl.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((sx - padX) / (W - 2 * padX)) * (points.length - 1));
    hoverIdx = Math.max(0, Math.min(points.length - 1, i));
  }
  function handleLeave() { hoverIdx = null; }
</script>

<div class="hourly card fade-in">
  <div class="head">
    <div class="title-row">
      <span class="title">Next 24 hours</span>
      {#if bands}
        <span class="legend">
          <span class="swatch line"></span><span>Truecast</span>
          <span class="swatch band"></span><span>Model spread</span>
        </span>
      {/if}
    </div>
    <span class="hint">{tempSymbol(appState.unit)}</span>
  </div>

  <svg
    bind:this={svgEl}
    viewBox="0 0 {W} {H}"
    class="chart"
    role="img"
    aria-label="Hourly temperature forecast"
    onpointermove={handleMove}
    onpointerleave={handleLeave}
  >
    <defs>
      <linearGradient id="area-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(124,196,255,0.35)" />
        <stop offset="100%" stop-color="rgba(124,196,255,0)" />
      </linearGradient>
      <linearGradient id="line-grad" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%"  stop-color="#9ae6b4" />
        <stop offset="100%" stop-color="#7cc4ff" />
      </linearGradient>
    </defs>

    <!-- horizontal grid -->
    {#each [0, 0.25, 0.5, 0.75, 1] as t (t)}
      <line
        x1={padX} x2={W - padX}
        y1={padTop + t * (H - padTop - padBottom)}
        y2={padTop + t * (H - padTop - padBottom)}
        stroke="rgba(255,255,255,0.05)"
        stroke-width="1"
      />
    {/each}

    {#if bandPath}
      <path d={bandPath} fill="rgba(124,196,255,0.10)" stroke="rgba(124,196,255,0.18)" stroke-width="0.8" />
    {/if}

    {#if areaPath}
      <path d={areaPath} fill="url(#area-grad)" />
    {/if}

    {#if linePath}
      <path d={linePath} fill="none" stroke="url(#line-grad)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
    {/if}

    <!-- ticks + labels -->
    {#each ticks as i (i)}
      {@const p = points[i]}
      <g>
        <line
          x1={x(i)} x2={x(i)}
          y1={H - padBottom} y2={H - padBottom + 4}
          stroke="rgba(255,255,255,0.1)"
        />
        <text
          x={x(i)} y={H - padBottom + 18}
          text-anchor="middle"
          fill="var(--text-mute)"
          font-size="10"
        >{fmtHour(p.time)}</text>
        <g transform="translate({x(i) - 9}, {H - padBottom + 22})">
          <foreignObject width="18" height="18">
            <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:center;">
              <WeatherIcon kind={weatherInfo(p.weatherCode, p.isDay).icon} size={16} animated={false} />
            </div>
          </foreignObject>
        </g>
      </g>
    {/each}

    <!-- hover marker -->
    {#if hoverIdx != null && points[hoverIdx]}
      {@const p = points[hoverIdx]!}
      {@const px = x(hoverIdx)}
      {@const py = y(conv(p.temp as number))}
      <line x1={px} x2={px} y1={padTop} y2={H - padBottom} stroke="rgba(255,255,255,0.18)" stroke-dasharray="3 3" />
      <circle cx={px} cy={py} r="5" fill="#0c1322" stroke="#7cc4ff" stroke-width="2" />
      <g transform="translate({Math.min(px + 12, W - 110)}, {Math.max(padTop + 8, py - 28)})">
        <rect width="100" height="46" rx="8" fill="#0c1322" stroke="rgba(255,255,255,0.14)" />
        <text x="10" y="18" fill="var(--text)" font-size="13" font-weight="600">
          {Math.round(conv(p.temp as number))}°{appState.unit}
        </text>
        <text x="10" y="34" fill="var(--text-mute)" font-size="10">
          {fmtHour(p.time)} · {p.precipProb ?? 0}% precip
        </text>
      </g>
    {/if}
  </svg>
</div>

<style>
  .hourly { padding: 18px 14px 8px; }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6px 8px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .title-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .title { font-weight: 600; font-size: 14px; }
  .legend { display: inline-flex; align-items: center; gap: 6px; color: var(--text-mute); font-size: 11px; }
  .legend > span { margin-left: 4px; }
  .swatch { width: 14px; height: 6px; border-radius: 2px; display: inline-block; }
  .swatch.line { background: linear-gradient(90deg, #9ae6b4, #7cc4ff); height: 3px; }
  .swatch.band { background: rgba(124, 196, 255, 0.18); border: 1px solid rgba(124, 196, 255, 0.3); }
  .hint { color: var(--text-mute); font-size: 11px; }
  .chart { width: 100%; height: auto; max-height: 320px; touch-action: none; }
</style>
