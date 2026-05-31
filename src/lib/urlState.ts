/**
 * Serialitza / deserialitza l'estat de l'aplicació als URL search params.
 * Usa claus curtes per mantenir la URL llegible.
 */
import {
  ViewId,
  ExploracioXAxis,
  ExploracioYAxis,
  AnalisiAxis,
  MapaFilters,
  ExploracioConfig,
  AnalisiConfig,
} from '../context/AppContext';

// ── Serialize ─────────────────────────────────────────────────────────────────

export function serializeToParams(
  activeView: ViewId,
  mapaFilters: MapaFilters,
  exploracioConfig: ExploracioConfig,
  analisiConfig: AnalisiConfig,
  maxPrice: number
): URLSearchParams {
  const p = new URLSearchParams();

  p.set('v', activeView);

  // Mapa
  mapaFilters.zones.forEach((z) => p.append('mz', z));
  mapaFilters.foods.forEach((f) => p.append('mf', f));
  mapaFilters.ambients.forEach((a) => p.append('ma', a));
  if (mapaFilters.openLunch)    p.set('ml', '1');
  if (mapaFilters.openDinner)   p.set('md', '1');
  if (mapaFilters.openWeekend)  p.set('mw', '1');

  // Exploració
  if (exploracioConfig.xAxis !== 'zone')  p.set('ex', exploracioConfig.xAxis);
  if (exploracioConfig.yAxis !== 'score') p.set('ey', exploracioConfig.yAxis);
  exploracioConfig.zones.forEach((z) => p.append('ez', z));
  exploracioConfig.foods.forEach((f) => p.append('ef', f));
  exploracioConfig.ambients.forEach((a) => p.append('ea', a));
  if (exploracioConfig.priceRange[0] > 0)
    p.set('ep0', String(exploracioConfig.priceRange[0]));
  if (exploracioConfig.priceRange[1] < maxPrice)
    p.set('ep1', String(exploracioConfig.priceRange[1]));
  if (exploracioConfig.minSamples > 1)
    p.set('ems', String(exploracioConfig.minSamples));

  // Anàlisi
  if (analisiConfig.xAxis !== 'price') p.set('ax', analisiConfig.xAxis);
  if (analisiConfig.yAxis !== 'score') p.set('ay', analisiConfig.yAxis);
  analisiConfig.zones.forEach((z) => p.append('az', z));
  analisiConfig.foods.forEach((f) => p.append('af', f));

  return p;
}

// ── Deserialize ───────────────────────────────────────────────────────────────

const VALID_VIEWS: ViewId[] = ['mapa', 'exploracio', 'analisi'];
const VALID_EXP_X: ExploracioXAxis[] = ['zone', 'food', 'ambient', 'restaurant'];
const VALID_EXP_Y: ExploracioYAxis[] = ['price', 'score', 'opinions', 'count'];
const VALID_ANA:   AnalisiAxis[]     = ['price', 'score', 'opinions', 'dist', 'renda'];

function oneOf<T extends string>(value: string | null, valid: T[], fallback: T): T {
  return value && (valid as string[]).includes(value) ? (value as T) : fallback;
}

export interface DeserializedState {
  activeView: ViewId;
  mapaFilters: MapaFilters;
  exploracioConfig: Omit<ExploracioConfig, 'priceRange'> & { priceRange: [number, number] };
  analisiConfig: AnalisiConfig;
  hasStoredPriceMax: boolean;
  storedPriceMax: number;
}

export function deserializeFromParams(p: URLSearchParams): DeserializedState {
  const ep1Raw = p.get('ep1');
  const storedPriceMax = ep1Raw !== null ? +ep1Raw : -1;

  return {
    activeView: oneOf(p.get('v'), VALID_VIEWS, 'mapa'),

    mapaFilters: {
      zones:      p.getAll('mz'),
      foods:      p.getAll('mf'),
      ambients:   p.getAll('ma'),
      openLunch:   p.has('ml'),
      openDinner:  p.has('md'),
      openWeekend: p.has('mw'),
    },

    exploracioConfig: {
      xAxis:      oneOf(p.get('ex'), VALID_EXP_X, 'zone'),
      yAxis:      oneOf(p.get('ey'), VALID_EXP_Y, 'score'),
      zones:      p.getAll('ez'),
      foods:      p.getAll('ef'),
      ambients:   p.getAll('ea'),
      priceRange: [p.get('ep0') ? +p.get('ep0')! : 0, storedPriceMax > 0 ? storedPriceMax : 200],
      minSamples: p.get('ems') ? +p.get('ems')! : 1,
    },

    analisiConfig: {
      xAxis: oneOf(p.get('ax'), VALID_ANA, 'price'),
      yAxis: oneOf(p.get('ay'), VALID_ANA, 'score'),
      zones: p.getAll('az'),
      foods: p.getAll('af'),
    },

    hasStoredPriceMax: ep1Raw !== null,
    storedPriceMax,
  };
}

