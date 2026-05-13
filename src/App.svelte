<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ConsensusSummary, ForecastBundle, Location, SourceRow } from './lib/types';
  import { appState, markUpdated } from './lib/state.svelte';
  import { designState } from './lib/design.svelte';
  import { enabledSources } from './lib/sources/registry';
  import { fetchForecast, fetchAirQuality } from './lib/api/forecast';
  import { mean, median, validNums, disagreementScore } from './lib/utils/stats';
  import { skyKind } from './lib/utils/weather';

  import AnimatedSky from './components/AnimatedSky.svelte';
  import DesignToggle from './components/DesignToggle.svelte';
  import DashboardShell from './components/dashboard/Shell.svelte';
  import EditorialShell from './components/editorial/Shell.svelte';

  // ---------- runtime state -----------------------------------------------
  let rows = $state<SourceRow[] | null>(null);
  let summary = $state<ConsensusSummary | null>(null);
  let topIds = $state<Set<string>>(new Set());
  let forecast = $state<ForecastBundle | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let statusText = $state('Search for a location, or use your current location.');
  let statusKind: 'idle' | 'loading' | 'ok' | 'err' = $state('idle');

  let refreshTimer: ReturnType<typeof setInterval> | null = null;
  const REFRESH_MS = 10 * 60 * 1000;
  let lastLoadedKey: string | null = null;

  // ---------- core fetch --------------------------------------------------
  async function loadAll(loc: Location) {
    loading = true;
    statusKind = 'loading';
    error = null;
    statusText = `Fetching ${enabledSources().length} sources for ${loc.name}…`;

    const enabled = enabledSources();
    const [sourceResults, fc, air] = await Promise.all([
      Promise.allSettled(enabled.map((s) => s.fetch(loc.lat, loc.lon))),
      fetchForecast(loc.lat, loc.lon).catch(() => null),
      fetchAirQuality(loc.lat, loc.lon),
    ]);

    const newRows: SourceRow[] = enabled.map((src, i) => {
      const r = sourceResults[i]!;
      if (r.status === 'fulfilled') {
        return {
          src,
          reading: r.value,
          ok: r.value.ok !== false,
          error: r.value.ok === false ? r.value.note ?? 'no data' : null,
        };
      }
      return { src, reading: null, ok: false, error: (r.reason as Error)?.message ?? 'failed' };
    });

    const good = newRows.filter((r) => r.ok && r.reading?.temp != null);
    if (!good.length) {
      rows = newRows;
      summary = null;
      forecast = null;
      topIds = new Set();
      loading = false;
      statusKind = 'err';
      error = 'All weather sources failed for this location.';
      statusText = 'No sources returned data. Try another location.';
      return;
    }

    const readings = good.map((g) => g.reading!);
    const temps = validNums(readings, 'temp');
    const feels = validNums(readings, 'feels');
    const hums  = validNums(readings, 'humidity');
    const winds = validNums(readings, 'wind');
    const codes = validNums(readings, 'weatherCode');

    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    const spread = tempMax - tempMin;
    const medT = median(temps)!;

    summary = {
      temp: mean(temps)!,
      feels: mean(feels) ?? 0,
      humidity: mean(hums) ?? 0,
      wind: mean(winds) ?? 0,
      weatherCode: codes.length ? Math.round(median(codes)!) : (fc?.current.weatherCode ?? null),
      tempMin,
      tempMax,
      spread,
      medianTemp: medT,
      count: good.length,
      total: newRows.length,
      disagreement: disagreementScore(spread),
    };

    const ranked = good.slice().sort(
      (a, b) => Math.abs(a.reading!.temp! - medT) - Math.abs(b.reading!.temp! - medT),
    );
    topIds = new Set(ranked.slice(0, 3).map((r) => r.src.id));

    rows = newRows;
    forecast = fc ? { ...fc, air } : null;

    markUpdated();
    loading = false;
    statusKind = 'ok';
    statusText = `${good.length} of ${newRows.length} sources reporting · auto-refresh every 10 min`;
  }

  function rankedTop3(): SourceRow[] {
    if (!summary || !rows) return [];
    return rows
      .filter((r) => r.ok && r.reading?.temp != null && topIds.has(r.src.id))
      .slice()
      .sort((a, b) => Math.abs(a.reading!.temp! - summary!.medianTemp) - Math.abs(b.reading!.temp! - summary!.medianTemp));
  }

  function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (appState.location && document.visibilityState === 'visible') {
        void loadAll(appState.location);
      }
    }, REFRESH_MS);
  }

  // Re-fetch whenever the active location changes (also runs on first paint
  // if a previous session left a saved location in localStorage).
  $effect(() => {
    const loc = appState.location;
    if (!loc) return;
    const key = `${loc.lat.toFixed(3)},${loc.lon.toFixed(3)}`;
    if (key === lastLoadedKey) return;
    lastLoadedKey = key;
    void loadAll(loc);
    if (!refreshTimer) startAutoRefresh();
  });

  onDestroy(() => { if (refreshTimer) clearInterval(refreshTimer); });

  const sky = $derived(skyKind(
    summary?.weatherCode ?? forecast?.current.weatherCode ?? null,
    forecast?.current.isDay ?? true,
  ));
</script>

<AnimatedSky kind={sky} />

{#if designState.design === 'b'}
  <EditorialShell
    {summary}
    {forecast}
    {rows}
    {topIds}
    {rankedTop3}
    {statusText}
    {statusKind}
    {error}
    onkeysSaved={() => appState.location && loadAll(appState.location)}
  />
{:else}
  <DashboardShell
    {summary}
    {forecast}
    {rows}
    {topIds}
    {rankedTop3}
    {statusText}
    {statusKind}
    {error}
    onkeysSaved={() => appState.location && loadAll(appState.location)}
  />
{/if}

<DesignToggle />
