import type { Source } from '../types';
import { meteoModelSource } from './openMeteo';
import { nwsSource } from './nws';
import { owmSource, weatherApiSource, tomorrowSource } from './paid';

export const sources: Source[] = [
  meteoModelSource('best_match',     'Open-Meteo',  'Ensemble best-match'),
  meteoModelSource('gfs_seamless',   'NOAA GFS',    'US Global Forecast System'),
  meteoModelSource('ecmwf_ifs025',   'ECMWF IFS',   'European Centre for Medium-Range Weather'),
  meteoModelSource('icon_seamless',  'DWD ICON',    'Deutscher Wetterdienst (Germany)'),
  meteoModelSource('gem_seamless',   'ECCC GEM',    'Environment & Climate Change Canada'),
  meteoModelSource('jma_seamless',   'JMA',         'Japan Meteorological Agency'),
  nwsSource(),
  owmSource(),
  weatherApiSource(),
  tomorrowSource(),
];

export const enabledSources = (): Source[] => sources.filter((s) => s.enabled());
