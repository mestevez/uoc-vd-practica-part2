/**
 * Serialitza / deserialitza l'estat de l'aplicació als URL search params.
 */
import {
  ViewId,
  ExploracioXAxis,
  ExploracioYAxis,
  AnalisiAxis,
  HeatMetric,
  HeatmapCategoryAxis,
  MapaFilters,
  ExploracioConfig,
  AnalisiConfig,
  HeatmapConfig,
} from '../context/AppContext';

export function serializeToParams(
  activeView: ViewId,
  mapaFilters: MapaFilters,
  exploracioConfig: ExploracioConfig,
  analisiConfig: AnalisiConfig,
  heatmapConfig: HeatmapConfig,
  maxPrice: number
): URLSearchParams {
  const p = new URLSearchParams();
  p.set('v', activeView);

  // Mapa
  mapaFilters.zones.forEach((z) => p.append('mz', z));
  mapaFilters.foods.forEach((f) => p.append('mf', f));
  mapaFilters.ambients.forEach((a) => p.append('ma', a));
  if (mapaFilters.openLunch) p.set('ml', '1');
  if (mapaFilters.openDinner) p.set('md', '1');
  if (mapaFilters.openWeekend) p.set('mw', '1');

  // Exploracio
  if (exploracioConfig.xAxis !== 'zone') p.set('ex', exploracioConfig.xAxis);
  if (exploracioConfig.yAxis !== 'score') p.set('ey', exploracioConfig.yAxis);
  exploracioConfig.zones.forEach((z) => p.append('ez', z));
  exploracioConfig.foods.forEach((f) => p.append('ef', f));
  exploracioConfig.ambients.forEach((a) => p.append('ea', a));
  if (exploracioConfig.priceRange[0] > 0) p.set('ep0', String(exploracioConfig.priceRange[0]));
  if (exploracioConfig.priceRange[1] < maxPrice) p.set('ep1', String(exploracioConfig.priceRange[1]));
  if (exploracioConfig.minSamples > 1) p.set('ems', String(exploracioConfig.minSamples));

  // Analisi
  if (analisiConfig.xAxis !== 'price') p.set('ax', analisiConfig.xAxis);
  if (analisiConfig.yAxis !== 'score') p.set('ay', analisiConfig.yAxis);
  analisiConfig.zones.forEach((z) => p.append('az', z));
  analisiConfig.foods.forEach((f) => p.append('af', f));

  // Heatmap
  if (heatmapConfig.metric !== 'count') p.set('hm', heatmapConfig.metric);
  if (heatmapConfig.xAxis !== 'food') p.set('hx', heatmapConfig.xAxis);
  if (heatmapConfig.yAxis !== 'zone') p.set('hy', heatmapConfig.yAxis);
  if (heatmapConfig.maxZones !== 20) p.set('hmz', String(heatmapConfig.maxZones));
  if (heatmapConfig.maxFoods !== 15) p.set('hmf', String(heatmapConfig.maxFoods));
  if (heatmapConfig.minSamples !== 3) p.set('hms', String(heatmapConfig.minSamples));

  return p;
}

const VALID_VIEWS: ViewId[] = ['mapa', 'exploracio', 'analisi', 'heatmap'];
const VALID_EXP_X: ExploracioXAxis[] = ['zone', 'food', 'ambient', 'restaurant'];
const VALID_EXP_Y: ExploracioYAxis[] = ['price', 'score', 'opinions', 'count'];
const VALID_ANA: AnalisiAxis[] = ['price', 'score', 'opinions', 'dist', 'renda'];
const VALID_METRIC: HeatMetric[] = ['count', 'score', 'price'];
const VALID_HEAT_AXIS: HeatmapCategoryAxis[] = ['zone', 'food', 'ambient'];

function oneOf<T extends string>(value: string | null, valid: T[], fallback: T): T {
  return value && (valid as string[]).includes(value) ? (value as T) : fallback;
}

export interface DeserializedState {
  activeView: ViewId;
  mapaFilters: MapaFilters;
  exploracioConfig: ExploracioConfig;
  analisiConfig: AnalisiConfig;
  heatmapConfig: HeatmapConfig;
  hasStoredPriceMax: boolean;
}

export function deserializeFromParams(p: URLSearchParams): DeserializedState {
  const ep1Raw = p.get('ep1');
  const storedPriceMax = ep1Raw !== null ? +ep1Raw : -1;

  return {
    activeView: oneOf(p.get('v'), VALID_VIEWS, 'mapa'),

    mapaFilters: {
      zones: p.getAll('mz'),
      foods: p.getAll('mf'),
      ambients: p.getAll('ma'),
      openLunch: p.has('ml'),
      openDinner: p.has('md'),
      openWeekend: p.has('mw'),
    },

    exploracioConfig: {
      xAxis: oneOf(p.get('ex'), VALID_EXP_X, 'zone'),
      yAxis: oneOf(p.get('ey'), VALID_EXP_Y, 'score'),
      zones: p.getAll('ez'),
      foods: p.getAll('ef'),
      ambients: p.getAll('ea'),
      priceRange: [p.get('ep0') ? +p.get('ep0')! : 0, storedPriceMax > 0 ? storedPriceMax : 200],
      minSamples: p.get('ems') ? +p.get('ems')! : 1,
    },

    analisiConfig: {
      xAxis: oneOf(p.get('ax'), VALID_ANA, 'price'),
      yAxis: oneOf(p.get('ay'), VALID_ANA, 'score'),
      zones: p.getAll('az'),
      foods: p.getAll('af'),
    },

    heatmapConfig: {
      metric: oneOf(p.get('hm'), VALID_METRIC, 'count'),
      xAxis: oneOf(p.get('hx'), VALID_HEAT_AXIS, 'food'),
      yAxis: oneOf(p.get('hy'), VALID_HEAT_AXIS, 'zone'),
      maxZones: p.get('hmz') ? +p.get('hmz')! : 20,
      maxFoods: p.get('hmf') ? +p.get('hmf')! : 15,
      minSamples: p.get('hms') ? +p.get('hms')! : 3,
    },

    hasStoredPriceMax: ep1Raw !== null,
  };
}
