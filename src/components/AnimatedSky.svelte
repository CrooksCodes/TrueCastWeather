<script lang="ts">
  import type { SkyKind } from '../lib/utils/weather';

  interface Props {
    kind: SkyKind;
  }
  const { kind }: Props = $props();
</script>

<div class="sky" class:clear-day={kind === 'clear-day'}
              class:clear-night={kind === 'clear-night'}
              class:cloudy={kind === 'cloudy'}
              class:rain={kind === 'rain'}
              class:snow={kind === 'snow'}
              class:thunder={kind === 'thunder'}
              class:fog={kind === 'fog'}
     aria-hidden="true">
  <div class="layer aurora a"></div>
  <div class="layer aurora b"></div>
  <div class="layer aurora c"></div>

  {#if kind === 'clear-night'}
    <div class="stars">
      {#each Array.from({ length: 60 }) as _, i (i)}
        <span class="star" style="--x:{(i * 137) % 100}%; --y:{(i * 79) % 100}%; --d:{(i % 5) * 0.7}s; --o:{0.4 + (i % 5) * 0.12}"></span>
      {/each}
    </div>
  {/if}

  {#if kind === 'rain' || kind === 'thunder'}
    <div class="rain">
      {#each Array.from({ length: 80 }) as _, i (i)}
        <span class="raindrop" style="--x:{(i * 11) % 100}%; --d:{(i % 7) * 0.13}s; --s:{0.6 + (i % 5) * 0.12}"></span>
      {/each}
    </div>
  {/if}

  {#if kind === 'snow'}
    <div class="snow">
      {#each Array.from({ length: 40 }) as _, i (i)}
        <span class="snowflake" style="--x:{(i * 23) % 100}%; --d:{(i % 9) * 0.6}s; --dur:{8 + (i % 6)}s">❄</span>
      {/each}
    </div>
  {/if}

  {#if kind === 'thunder'}
    <div class="bolt-flash"></div>
  {/if}
</div>

<style>
  .sky {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    background: var(--bg-0);
    transition: background 1.2s ease;
  }
  .sky.clear-day {
    background: radial-gradient(1400px 700px at 15% -10%, rgba(124,196,255,0.35), transparent 55%),
                radial-gradient(1100px 600px at 100% 0%, rgba(255,209,102,0.18), transparent 55%),
                linear-gradient(180deg, #11203a 0%, #060b18 80%);
  }
  .sky.clear-night {
    background: radial-gradient(1400px 700px at 15% -10%, rgba(70,90,170,0.35), transparent 55%),
                radial-gradient(1100px 600px at 100% 0%, rgba(120,140,255,0.10), transparent 55%),
                linear-gradient(180deg, #050912 0%, #02040a 80%);
  }
  .sky.cloudy {
    background: radial-gradient(1400px 700px at 15% -10%, rgba(154,169,200,0.20), transparent 55%),
                linear-gradient(180deg, #1a2238 0%, #060912 80%);
  }
  .sky.rain {
    background: radial-gradient(1400px 700px at 50% -10%, rgba(80,110,160,0.30), transparent 55%),
                linear-gradient(180deg, #0e1729 0%, #050811 80%);
  }
  .sky.snow {
    background: radial-gradient(1400px 700px at 50% -10%, rgba(180,200,235,0.22), transparent 55%),
                linear-gradient(180deg, #131c30 0%, #060912 80%);
  }
  .sky.thunder {
    background: radial-gradient(1400px 700px at 50% -10%, rgba(60,70,110,0.40), transparent 55%),
                linear-gradient(180deg, #0a0e1c 0%, #030509 80%);
  }
  .sky.fog {
    background: radial-gradient(1400px 700px at 30% -10%, rgba(160,170,195,0.16), transparent 55%),
                linear-gradient(180deg, #181f30 0%, #07090f 80%);
  }

  .layer {
    position: absolute;
    inset: -25%;
    filter: blur(70px);
    opacity: 0.55;
    will-change: transform;
  }
  .aurora.a {
    background: radial-gradient(40% 40% at 30% 30%, var(--accent), transparent 60%);
    animation: float 22s ease-in-out infinite alternate;
  }
  .aurora.b {
    background: radial-gradient(40% 40% at 70% 60%, var(--accent-2), transparent 60%);
    animation: float 28s ease-in-out -8s infinite alternate-reverse;
    opacity: 0.4;
  }
  .aurora.c {
    background: radial-gradient(40% 40% at 50% 80%, var(--accent-3), transparent 60%);
    animation: float 34s ease-in-out -14s infinite alternate;
    opacity: 0.3;
  }

  @keyframes float {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(8%, -6%) scale(1.06); }
    100% { transform: translate(-6%, 4%) scale(0.98); }
  }

  /* Stars */
  .stars { position: absolute; inset: 0; }
  .star {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 2px;
    height: 2px;
    background: #fff;
    border-radius: 50%;
    opacity: var(--o);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
    animation: twinkle 3.5s ease-in-out infinite;
    animation-delay: var(--d);
  }
  @keyframes twinkle { 0%, 100% { opacity: var(--o); } 50% { opacity: 0.1; } }

  /* Rain */
  .rain { position: absolute; inset: 0; }
  .raindrop {
    position: absolute;
    left: var(--x);
    top: -10%;
    width: 1px;
    height: 28px;
    background: linear-gradient(180deg, transparent, rgba(170, 200, 240, 0.65));
    transform: scale(var(--s));
    animation: rain-fall 0.9s linear infinite;
    animation-delay: var(--d);
  }
  @keyframes rain-fall {
    from { transform: translateY(0) scale(var(--s)); }
    to   { transform: translateY(120vh) scale(var(--s)); }
  }

  /* Snow */
  .snow { position: absolute; inset: 0; }
  .snowflake {
    position: absolute;
    left: var(--x);
    top: -10%;
    color: #e9f3ff;
    font-size: 12px;
    opacity: 0.85;
    animation: snow-fall var(--dur) linear infinite;
    animation-delay: var(--d);
  }
  @keyframes snow-fall {
    0%   { transform: translate(0, 0) rotate(0); }
    100% { transform: translate(20px, 110vh) rotate(360deg); }
  }

  /* Thunder flash */
  .bolt-flash {
    position: absolute;
    inset: 0;
    background: rgba(220, 230, 255, 0.25);
    opacity: 0;
    animation: bolt 7s ease-in-out infinite;
  }
  @keyframes bolt {
    0%, 92%, 100% { opacity: 0; }
    93%, 95%      { opacity: 0.55; }
    94%           { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .layer, .star, .raindrop, .snowflake, .bolt-flash { animation: none !important; }
    .sky { transition: none !important; }
  }
</style>
