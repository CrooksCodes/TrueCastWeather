<script lang="ts">
  import type { ConsensusSummary, ForecastBundle, Location, SourceRow } from '../../lib/types';
  import { appState } from '../../lib/state.svelte';

  import SearchPill from './SearchPill.svelte';
  import Hero from './Hero.svelte';
  import Section from './Section.svelte';
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
</script>

<div class="layout">
  <SearchPill />

  {#if summary && appState.location}
    <Hero
      summary={summary}
      location={appState.location}
      isDay={forecast?.current.isDay ?? true}
      weatherCode={summary.weatherCode}
      timezone={forecast?.current.timezone ?? null}
      timezoneAbbr={forecast?.current.timezoneAbbr ?? null}
    />

    <div class="ed-cols">
      <div class="col-main">
        {#if forecast}
          <Section
            eyebrow="Next 24 hours"
            title="Where the temperature drifts."
            subtitle="The Truecast line is drawn through the best-match ensemble. The translucent band shows the spread across GFS, ECMWF, and ICON. A wide band is uncertainty made visible."
          >
            <HourlyChart hourly={forecast.hourly} />
          </Section>

          <Section
            eyebrow="The week ahead"
            title="Seven days, in shape."
          >
            <DailyForecast days={forecast.daily} />
          </Section>

          <Section
            eyebrow="Air & sky"
            title="What you're breathing, when the sun moves."
          >
            <div class="two-col">
              <AirQualityCard air={forecast.air} />
              <SunUVCard
                sunrise={forecast.current.sunrise}
                sunset={forecast.current.sunset}
                uv={forecast.current.uv}
              />
            </div>
          </Section>
        {/if}
      </div>

      {#if rows}
        <aside class="col-side col-models">
          <Section
            eyebrow="The Models"
            title="Who agrees with whom."
            subtitle="Top three sit closest to the median. The rest are a snapshot of where each operator's model lands right now. NWS only reports inside the United States — that's expected."
          >
            <div class="top"><TopSources rows={rankedTop3()} {summary} /></div>
            <div class="all"><SourcesTable {rows} {topIds} /></div>
          </Section>
        </aside>
      {/if}

      <aside class="col-side col-settings">
        <Section
          eyebrow="Settings"
          title="Bring your own keys."
          subtitle="Three slots are pre-wired but disabled until you paste a key. Keys never leave this device — they live in localStorage and get sent only to the matching provider."
        >
          <ApiKeysPanel onsave={onkeysSaved} />
        </Section>
      </aside>
    </div>

    <footer class="ed-foot">
      <div>Built for jeremycrooks.ca · No tracking · No backend</div>
      <div>Free data via Open-Meteo &amp; NWS</div>
    </footer>
  {:else}
    <section class="ed-empty">
      <div>
        <div class="ed-eyebrow">{statusText}</div>
        <h1>What does the sky look like?</h1>
        <p>Search for any city above, or let the browser share where you are.</p>
        {#if error}<div class="ed-error">{error}</div>{/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .layout {
    position: relative;
    z-index: 1;
    min-height: 100vh;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  @media (max-width: 720px) {
    .two-col { grid-template-columns: 1fr; }
  }

  /* Three-column layout: Models | Forecast | Settings
     DOM order is Forecast → Models → Settings so the collapsed (mobile) view
     leads with the primary content. Desktop uses `order` to put Models on the
     left, Forecast in the middle, Settings on the right. */
  .ed-cols {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.75fr) minmax(0, 1fr);
    gap: 36px;
    max-width: none;
    margin: 0;
    padding: 22px 1.5vw;
    align-items: start;
  }
  .col-models   { order: 1; }
  .col-main     { order: 2; }
  .col-settings { order: 3; }
  .ed-cols :global(.ed-sectn) {
    padding: 0;
    max-width: none;
    margin: 0;
  }
  .col-main {
    display: flex;
    flex-direction: column;
    gap: 28px;
    min-width: 0;
  }
  .col-side {
    min-width: 0;
    position: sticky;
    top: 78px;
    max-height: calc(100vh - 90px);
    overflow-y: auto;
  }

  .top { margin-bottom: 16px; min-width: 0; }
  .all { min-width: 0; overflow-x: auto; }
  /* Let the sources table breathe horizontally only once we've collapsed
     to a single column — otherwise the narrow side rail forces an inner
     horizontal scroll. */
  @media (max-width: 1180px) {
    .ed-cols {
      grid-template-columns: 1fr;
      gap: 28px;
      padding: 22px 4vw;
    }
    .col-models, .col-main, .col-settings { order: unset; }
    .col-side {
      position: static;
      top: auto;
      max-height: none;
      overflow-y: visible;
    }
    .col-models :global(.table-wrap) { overflow-x: auto; }
    .col-models :global(table.sources) { min-width: 460px; }
  }

  .ed-foot {
    padding: 24px 6vw 32px;
    color: var(--text-mute);
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    border-top: 1px solid var(--line);
  }

  .ed-empty {
    min-height: 100vh;
    display: grid; place-items: center;
    padding: 120px 24px 80px;
    text-align: center;
  }
  .ed-empty > div { max-width: 560px; }
  .ed-eyebrow {
    color: var(--text-mute);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .ed-empty h1 {
    font-family: var(--font-display);
    font-size: clamp(56px, 8vw, 112px);
    margin: 0 0 16px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -2.5px;
  }
  .ed-empty p {
    color: var(--text-dim);
    font-size: 17px;
    line-height: 1.5;
    margin: 0;
  }
  .ed-error {
    margin-top: 24px;
    color: var(--bad);
    font-size: 13px;
    background: oklch(72% 0.18 25 / 0.08);
    border: 1px solid oklch(72% 0.18 25 / 0.25);
    padding: 8px 14px;
    border-radius: 10px;
    display: inline-block;
  }
</style>
