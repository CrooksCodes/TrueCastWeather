<script lang="ts">
  import type { ConsensusSummary, ForecastBundle, Location, SourceRow } from '../../lib/types';
  import { appState } from '../../lib/state.svelte';

  import Sidebar from './Sidebar.svelte';
  import Topbar from './Topbar.svelte';
  import BottomNav from './BottomNav.svelte';
  import HeroTile from './HeroTile.svelte';
  import HourlyChart from '../HourlyChart.svelte';
  import DailyForecast from '../DailyForecast.svelte';
  import AirQualityCard from '../AirQualityCard.svelte';
  import SunUVCard from '../SunUVCard.svelte';
  import SourcesTable from '../SourcesTable.svelte';
  import TopSources from '../TopSources.svelte';
  import ApiKeysPanel from '../ApiKeysPanel.svelte';

  interface Props {
    summary: ConsensusSummary | null;
    forecast: ForecastBundle | null;
    rows: SourceRow[] | null;
    topIds: Set<string>;
    rankedTop3: () => SourceRow[];
    statusText: string;
    statusKind: 'idle' | 'loading' | 'ok' | 'err';
    error: string | null;
    onkeysSaved: () => void;
  }
  const {
    summary, forecast, rows, topIds, rankedTop3,
    statusText, statusKind, error, onkeysSaved,
  }: Props = $props();

  let section = $state('now');
  let drawerOpen = $state(false);

  function pickSection(s: string) {
    section = s;
    drawerOpen = false;
  }
</script>

<div class="layout" data-section={section} class:drawer-open={drawerOpen}>
  {#if drawerOpen}
    <button class="scrim" aria-label="Close menu" onclick={() => (drawerOpen = false)}></button>
  {/if}
  <Sidebar {section} onsection={pickSection} onnavigate={() => (drawerOpen = false)} />

  <main class="main">
    <Topbar {section} onmenu={() => (drawerOpen = true)} />

    <div class="content" data-section={section}>
      {#if !summary || !appState.location}
        <div class="placeholder">
          <div class="ph-inner">
            <div class="ph-eyebrow">{statusText}</div>
            <h1>Pick a location</h1>
            <p>Use the search in the sidebar, or hit the location icon to use where you are right now.</p>
            {#if error}<div class="ph-error">{error}</div>{/if}
          </div>
        </div>
      {:else}
        {#if section === 'now'}
          <div class="bento">
            <section class="tile tile-hero">
              <HeroTile
                summary={summary}
                location={appState.location}
                isDay={forecast?.current.isDay ?? true}
                weatherCode={summary.weatherCode}
                timezone={forecast?.current.timezone ?? null}
                timezoneAbbr={forecast?.current.timezoneAbbr ?? null}
              />
            </section>

            {#if forecast}
              <section class="tile tile-hourly">
                <HourlyChart hourly={forecast.hourly} />
              </section>
              <section class="tile tile-air">
                <AirQualityCard air={forecast.air} />
              </section>
              <section class="tile tile-sun">
                <SunUVCard
                  sunrise={forecast.current.sunrise}
                  sunset={forecast.current.sunset}
                  uv={forecast.current.uv}
                />
              </section>
              <section class="tile tile-daily">
                <DailyForecast days={forecast.daily} />
              </section>
            {/if}
          </div>
        {:else if section === 'hourly' && forecast}
          <div class="single">
            <h2 class="sectn-h">Hourly · next 24h</h2>
            <HourlyChart hourly={forecast.hourly} />
          </div>
        {:else if section === 'daily' && forecast}
          <div class="single">
            <h2 class="sectn-h">7-day outlook</h2>
            <DailyForecast days={forecast.daily} />
          </div>
        {:else if section === 'air' && forecast}
          <div class="single split">
            <div>
              <h2 class="sectn-h">Air quality</h2>
              <AirQualityCard air={forecast.air} />
            </div>
            <div>
              <h2 class="sectn-h">Sun &amp; UV</h2>
              <SunUVCard
                sunrise={forecast.current.sunrise}
                sunset={forecast.current.sunset}
                uv={forecast.current.uv}
              />
            </div>
          </div>
        {:else if section === 'sources' && rows}
          <div class="single">
            <h2 class="sectn-h">Top 3 closest to Truecast</h2>
            <TopSources rows={rankedTop3()} {summary} />
            <h2 class="sectn-h sectn-h-second">All sources</h2>
            <SourcesTable {rows} {topIds} />
          </div>
        {:else if section === 'settings'}
          <div class="single">
            <h2 class="sectn-h">Settings</h2>
            <ApiKeysPanel onsave={onkeysSaved} />
          </div>
        {/if}
      {/if}
    </div>

    <div class="mobile-nav">
      <BottomNav {section} onsection={(s) => (section = s)} />
    </div>
  </main>
</div>

<style>
  .layout {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
  }

  .main {
    display: flex; flex-direction: column;
    min-width: 0;
    min-height: 100vh;
  }

  .content {
    flex: 1; min-height: 0;
    padding: 22px;
    overflow-y: auto;
  }
  .content[data-section="now"] { padding: 18px; }

  .bento {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    grid-template-rows: minmax(320px, auto) auto auto;
    grid-template-areas:
      "hero    air"
      "hourly  sun"
      "daily   daily";
    gap: 14px;
    height: 100%;
    min-height: 0;
  }
  .tile-hero   { grid-area: hero;   }
  .tile-hourly { grid-area: hourly; }
  .tile-air    { grid-area: air;    }
  .tile-sun    { grid-area: sun;    }
  .tile-daily  { grid-area: daily;  }

  .tile {
    background: oklch(13% 0.018 260 / 0.55);
    border: 1px solid var(--line);
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .tile:hover { border-color: var(--line-strong); }

  /* Neutralize nested card chrome from reused components — the tile is the card. */
  .tile :global(.card) {
    background: transparent;
    border: 0;
    box-shadow: none;
    border-radius: 0;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    padding: 0;
    height: 100%;
  }
  /* Top-sources / sources-table inside a tile shouldn't get the auto-fit grid. */
  .tile :global(.hourly),
  .tile :global(.daily),
  .tile :global(.aqi),
  .tile :global(.sun) { height: 100%; }
  /* Single-section pages: keep the card chrome but remove the duplicate fade. */
  .single :global(.card.fade-in) { animation: none; }

  .single {
    max-width: 980px;
    margin: 0 auto;
    display: flex; flex-direction: column;
    gap: 14px;
  }
  .single.split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .sectn-h {
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    color: var(--text-mute);
  }
  .sectn-h-second { margin-top: 16px; }

  .placeholder {
    height: 100%;
    display: grid; place-items: center;
    padding: 40px 20px;
  }
  .ph-inner {
    text-align: center;
    max-width: 460px;
    display: flex; flex-direction: column;
    gap: 14px;
  }
  .ph-eyebrow {
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--text-mute);
    font-weight: 600;
  }
  .ph-inner h1 {
    font-family: var(--font-display);
    font-size: clamp(40px, 5vw, 64px);
    margin: 0;
    line-height: 1;
    font-weight: 400;
    letter-spacing: -1.5px;
  }
  .ph-inner p {
    margin: 0;
    color: var(--text-dim);
    font-size: 15px;
    line-height: 1.5;
  }
  .ph-error {
    color: var(--bad);
    font-size: 13px;
    background: oklch(72% 0.18 25 / 0.08);
    border: 1px solid oklch(72% 0.18 25 / 0.25);
    padding: 8px 14px;
    border-radius: 10px;
  }

  .mobile-nav { display: none; }

  @media (max-width: 1024px) {
    .bento {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      grid-template-areas:
        "hero"
        "hourly"
        "air"
        "sun"
        "daily";
    }
    .single.split { grid-template-columns: 1fr; }
  }

  .scrim {
    display: none;
    position: fixed;
    inset: 0;
    background: oklch(8% 0.01 260 / 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 0;
    z-index: 40;
    cursor: pointer;
    animation: scrim-in 200ms ease-out;
  }
  @keyframes scrim-in { from { opacity: 0; } to { opacity: 1; } }

  @media (max-width: 720px) {
    .layout { grid-template-columns: 1fr; }
    :global(.layout > aside.sb) {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: min(86vw, 320px);
      transform: translateX(-100%);
      transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 50;
      height: 100vh;
      overflow-y: auto;
    }
    .layout.drawer-open :global(> aside.sb) {
      transform: translateX(0);
    }
    .scrim { display: block; }
    .content { padding: 16px; }
    .content[data-section="now"] { padding: 14px; }
    .mobile-nav { display: block; }
  }
</style>
