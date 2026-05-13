<script lang="ts">
  import type { IconKind } from '../lib/utils/weather';

  interface Props {
    kind: IconKind;
    size?: number;
    animated?: boolean;
  }
  const { kind, size = 48, animated = true }: Props = $props();
</script>

<svg
  class="wx-icon"
  class:animated
  width={size}
  height={size}
  viewBox="0 0 64 64"
  fill="none"
  aria-hidden="true"
>
  {#if kind === 'clear-day'}
    <circle cx="32" cy="32" r="11" fill="url(#sun-grad)" />
    <g class="rays" stroke="#ffd166" stroke-width="2.5" stroke-linecap="round">
      <line x1="32" y1="6"  x2="32" y2="14" />
      <line x1="32" y1="50" x2="32" y2="58" />
      <line x1="6"  y1="32" x2="14" y2="32" />
      <line x1="50" y1="32" x2="58" y2="32" />
      <line x1="13" y1="13" x2="19" y2="19" />
      <line x1="45" y1="45" x2="51" y2="51" />
      <line x1="13" y1="51" x2="19" y2="45" />
      <line x1="45" y1="19" x2="51" y2="13" />
    </g>
    <defs>
      <radialGradient id="sun-grad" cx="0.4" cy="0.4">
        <stop offset="0%" stop-color="#ffe69b" />
        <stop offset="100%" stop-color="#ffb43b" />
      </radialGradient>
    </defs>
  {:else if kind === 'clear-night'}
    <path d="M42 36c-9 0-16-7-16-16 0-3 .8-6 2.3-8.5C20 13 14 21 14 30c0 11 9 20 20 20 8 0 15-5 18-12-3 1-6.5 1.6-10 1.6Z"
          fill="url(#moon-grad)" />
    <circle cx="48" cy="14" r="1.5" fill="#fff" opacity="0.85" />
    <circle cx="20" cy="10" r="1" fill="#fff" opacity="0.7" />
    <circle cx="55" cy="28" r="1" fill="#fff" opacity="0.6" />
    <defs>
      <linearGradient id="moon-grad" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#e9eefc" />
        <stop offset="100%" stop-color="#a9b4d9" />
      </linearGradient>
    </defs>
  {:else if kind === 'partly-cloudy-day'}
    <circle cx="22" cy="22" r="9" fill="url(#pc-sun)" />
    <g stroke="#ffd166" stroke-width="2" stroke-linecap="round" class="rays">
      <line x1="22" y1="4"  x2="22" y2="9" />
      <line x1="6"  y1="22" x2="11" y2="22" />
      <line x1="10" y1="10" x2="14" y2="14" />
      <line x1="34" y1="10" x2="30" y2="14" />
    </g>
    <path class="cloud" d="M22 44c-4 0-7 3-7 7h32c3 0 6-2.5 6-6s-3-6-6-6c-1 0-2 .2-3 .6-1.4-3.8-5-6.6-9.4-6.6-5.5 0-10 4.4-10 10 0 .3 0 .7.1 1Z"
          fill="url(#pc-cloud)" />
    <defs>
      <radialGradient id="pc-sun" cx="0.4" cy="0.4">
        <stop offset="0%" stop-color="#ffe69b" />
        <stop offset="100%" stop-color="#ffb43b" />
      </radialGradient>
      <linearGradient id="pc-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#dbe4f7" />
        <stop offset="100%" stop-color="#9aa9c8" />
      </linearGradient>
    </defs>
  {:else if kind === 'partly-cloudy-night'}
    <path d="M22 24c-5 0-9-4-9-9 0-1.5.4-3 1-4-5 1.5-9 6-9 11 0 6 5 11 11 11 4 0 8-2.5 10-6-1.3.6-2.5 1-4 1Z"
          fill="url(#pcn-moon)" transform="translate(8, 0)" />
    <path class="cloud" d="M22 44c-4 0-7 3-7 7h32c3 0 6-2.5 6-6s-3-6-6-6c-1 0-2 .2-3 .6-1.4-3.8-5-6.6-9.4-6.6-5.5 0-10 4.4-10 10 0 .3 0 .7.1 1Z"
          fill="url(#pcn-cloud)" />
    <defs>
      <linearGradient id="pcn-moon" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#e9eefc" />
        <stop offset="100%" stop-color="#a9b4d9" />
      </linearGradient>
      <linearGradient id="pcn-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#9aa9c8" />
        <stop offset="100%" stop-color="#5d6b8a" />
      </linearGradient>
    </defs>
  {:else if kind === 'cloudy' || kind === 'overcast'}
    <path class="cloud" d="M16 42c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#cloud-grad)" />
    <path class="cloud2" d="M8 50c-3 0-5 2-5 4.5h22c2 0 4-1.5 4-3.5s-2-3.5-4-3.5c-.5 0-1 .1-1.5.3-.8-2.3-3-3.8-5.5-3.8-3.4 0-6 2.7-6 6 0 .2 0 .4 0 .5Z"
          fill="url(#cloud2-grad)" opacity="0.7" />
    <defs>
      <linearGradient id="cloud-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color={kind === 'overcast' ? '#9eaac4' : '#dbe4f7'} />
        <stop offset="100%" stop-color={kind === 'overcast' ? '#6b7593' : '#9aa9c8'} />
      </linearGradient>
      <linearGradient id="cloud2-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#aab7d3" />
        <stop offset="100%" stop-color="#7384a3" />
      </linearGradient>
    </defs>
  {:else if kind === 'rain' || kind === 'rain-heavy'}
    <path d="M16 30c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#rain-cloud)" />
    <g class="drops" stroke="#7cc4ff" stroke-width="2.5" stroke-linecap="round">
      <line x1="20" y1="44" x2="17" y2="52" />
      <line x1="30" y1="44" x2="27" y2="52" />
      <line x1="40" y1="44" x2="37" y2="52" />
      {#if kind === 'rain-heavy'}
        <line x1="25" y1="48" x2="22" y2="56" />
        <line x1="35" y1="48" x2="32" y2="56" />
        <line x1="45" y1="48" x2="42" y2="56" />
      {/if}
    </g>
    <defs>
      <linearGradient id="rain-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#9eaac4" />
        <stop offset="100%" stop-color="#5d6884" />
      </linearGradient>
    </defs>
  {:else if kind === 'snow' || kind === 'snow-heavy'}
    <path d="M16 30c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#snow-cloud)" />
    <g class="flakes" fill="#e9f3ff">
      <text x="18" y="52" font-size="10">❄</text>
      <text x="30" y="56" font-size="10">❄</text>
      <text x="42" y="52" font-size="10">❄</text>
      {#if kind === 'snow-heavy'}
        <text x="24" y="60" font-size="10">❄</text>
        <text x="36" y="60" font-size="10">❄</text>
      {/if}
    </g>
    <defs>
      <linearGradient id="snow-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#cfd8ee" />
        <stop offset="100%" stop-color="#8390ad" />
      </linearGradient>
    </defs>
  {:else if kind === 'sleet'}
    <path d="M16 30c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#sleet-cloud)" />
    <g class="drops" stroke="#7cc4ff" stroke-width="2" stroke-linecap="round">
      <line x1="20" y1="44" x2="18" y2="50" />
      <line x1="40" y1="44" x2="38" y2="50" />
    </g>
    <text x="28" y="54" font-size="10" fill="#e9f3ff">❄</text>
    <defs>
      <linearGradient id="sleet-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#b8c2dc" />
        <stop offset="100%" stop-color="#6c7791" />
      </linearGradient>
    </defs>
  {:else if kind === 'fog'}
    <path d="M16 26c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#fog-cloud)" opacity="0.55" />
    <g class="fog-lines" stroke="#cfd8ee" stroke-width="3" stroke-linecap="round">
      <line x1="8"  y1="42" x2="56" y2="42" />
      <line x1="14" y1="50" x2="50" y2="50" />
      <line x1="10" y1="58" x2="54" y2="58" />
    </g>
    <defs>
      <linearGradient id="fog-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#cfd8ee" />
        <stop offset="100%" stop-color="#8590ad" />
      </linearGradient>
    </defs>
  {:else if kind === 'thunder' || kind === 'thunder-hail'}
    <path d="M16 26c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#th-cloud)" />
    <path class="bolt" d="M30 36 L24 50 L31 50 L26 60 L40 44 L33 44 L38 36 Z"
          fill="#ffd166" stroke="#ffb43b" stroke-width="0.5" />
    {#if kind === 'thunder-hail'}
      <circle cx="20" cy="56" r="2" fill="#cfe6ff" />
      <circle cx="46" cy="56" r="2" fill="#cfe6ff" />
    {/if}
    <defs>
      <linearGradient id="th-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#7d869f" />
        <stop offset="100%" stop-color="#3d4660" />
      </linearGradient>
    </defs>
  {:else if kind === 'drizzle'}
    <path d="M16 30c-5 0-9 3.5-9 8h44c4 0 7-3 7-7s-3-7-7-7c-1 0-2 .2-3 .5-1.7-4.5-6-7.5-11-7.5-7 0-12.5 5.5-12.5 12.5 0 .3 0 .7.1 1Z"
          fill="url(#drz-cloud)" />
    <g class="drops" stroke="#7cc4ff" stroke-width="2" stroke-linecap="round">
      <line x1="22" y1="44" x2="20" y2="48" />
      <line x1="32" y1="44" x2="30" y2="48" />
      <line x1="42" y1="44" x2="40" y2="48" />
    </g>
    <defs>
      <linearGradient id="drz-cloud" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#b6c2dc" />
        <stop offset="100%" stop-color="#6c7791" />
      </linearGradient>
    </defs>
  {:else}
    <circle cx="32" cy="32" r="14" fill="none" stroke="var(--text-mute)" stroke-width="2" />
    <text x="32" y="38" font-size="18" text-anchor="middle" fill="var(--text-mute)">?</text>
  {/if}
</svg>

<style>
  .wx-icon { display: inline-block; vertical-align: middle; }
  .wx-icon.animated .rays {
    transform-origin: 32px 32px;
    animation: spin 22s linear infinite;
  }
  .wx-icon.animated .cloud {
    animation: drift 6s ease-in-out infinite;
    transform-origin: center;
  }
  .wx-icon.animated .cloud2 {
    animation: drift 7s ease-in-out -2s infinite;
  }
  .wx-icon.animated .drops line {
    animation: drop 1s linear infinite;
    transform-origin: center;
  }
  .wx-icon.animated .drops line:nth-child(2) { animation-delay: 0.3s; }
  .wx-icon.animated .drops line:nth-child(3) { animation-delay: 0.6s; }
  .wx-icon.animated .drops line:nth-child(4) { animation-delay: 0.15s; }
  .wx-icon.animated .drops line:nth-child(5) { animation-delay: 0.45s; }
  .wx-icon.animated .drops line:nth-child(6) { animation-delay: 0.75s; }
  .wx-icon.animated .flakes text {
    animation: snow-fall 2.5s linear infinite;
  }
  .wx-icon.animated .flakes text:nth-child(2) { animation-delay: 0.6s; }
  .wx-icon.animated .flakes text:nth-child(3) { animation-delay: 1.2s; }
  .wx-icon.animated .flakes text:nth-child(4) { animation-delay: 0.3s; }
  .wx-icon.animated .flakes text:nth-child(5) { animation-delay: 0.9s; }
  .wx-icon.animated .bolt {
    animation: flicker 2.4s ease-in-out infinite;
    transform-origin: center;
  }
  .wx-icon.animated .fog-lines line {
    stroke-dasharray: 30 12;
    animation: drift-h 5s linear infinite;
  }
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes drift  { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(2px); } }
  @keyframes drift-h { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -42; } }
  @keyframes drop   { 0% { opacity: 0; transform: translateY(-4px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(4px); } }
  @keyframes snow-fall { 0% { opacity: 0; transform: translateY(-3px) rotate(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(4px) rotate(120deg); } }
  @keyframes flicker { 0%, 50%, 100% { opacity: 1; } 60% { opacity: 0.3; } 65% { opacity: 1; } 70% { opacity: 0.5; } }

  @media (prefers-reduced-motion: reduce) {
    .wx-icon.animated * { animation: none !important; }
  }
</style>
