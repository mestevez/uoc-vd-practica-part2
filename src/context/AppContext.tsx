import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { loadRestaurantData, Restaurant } from '../lib/restaurantData';
import { applyMapaFilters, applyExploracioFilters, applyAnalisiFilters } from '../lib/filterUtils';
import { deserializeFromParams, serializeToParams } from '../lib/urlState';

export type ViewId = 'mapa' | 'exploracio' | 'analisi' | 'heatmap';
export type ExploracioXAxis = 'zone' | 'food' | 'ambient' | 'restaurant';
export type ExploracioYAxis = 'price' | 'score' | 'opinions' | 'count';
export type AnalisiAxis = 'price' | 'score' | 'opinions' | 'dist' | 'renda';
export type HeatMetric = 'count' | 'score' | 'price';
export type HeatmapCategoryAxis = 'zone' | 'food' | 'ambient';

export interface MapaFilters {
  zones: string[];
  foods: string[];
  ambients: string[];
  openLunch: boolean;
  openDinner: boolean;
  openWeekend: boolean;
}

export interface ExploracioConfig {
  xAxis: ExploracioXAxis;
  yAxis: ExploracioYAxis;
  zones: string[];
  foods: string[];
  ambients: string[];
  priceRange: [number, number];
  minSamples: number;
}

export interface AnalisiConfig {
  xAxis: AnalisiAxis;
  yAxis: AnalisiAxis;
  zones: string[];
  foods: string[];
}

export interface HeatmapConfig {
  metric: HeatMetric;
  xAxis: HeatmapCategoryAxis;
  yAxis: HeatmapCategoryAxis;
  maxZones: number;
  maxFoods: number;
  minSamples: number;
}

interface AppContextValue {
  allData: Restaurant[];
  filteredData: Restaurant[];
  loading: boolean;
  error: string | null;
  maxPrice: number;

  activeView: ViewId;
  setActiveView: (v: ViewId) => void;

  mapaFilters: MapaFilters;
  updateMapaFilters: (patch: Partial<MapaFilters>) => void;
  resetMapaFilters: () => void;

  exploracioConfig: ExploracioConfig;
  updateExploracioConfig: (patch: Partial<ExploracioConfig>) => void;
  resetExploracioConfig: () => void;

  analisiConfig: AnalisiConfig;
  updateAnalisiConfig: (patch: Partial<AnalisiConfig>) => void;
  resetAnalisiConfig: () => void;

  heatmapConfig: HeatmapConfig;
  updateHeatmapConfig: (patch: Partial<HeatmapConfig>) => void;
  resetHeatmapConfig: () => void;

  resetAllPanels: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialFromUrl = deserializeFromParams(new URLSearchParams(window.location.search));

export function AppProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeView, setActiveViewState] = useState<ViewId>(initialFromUrl.activeView);

  const DEFAULT_MAPA: MapaFilters = {
    zones: [],
    foods: [],
    ambients: [],
    openLunch: false,
    openDinner: false,
    openWeekend: false,
  };

  const DEFAULT_EXPLORACIO: ExploracioConfig = {
    xAxis: 'zone',
    yAxis: 'score',
    zones: [],
    foods: [],
    ambients: [],
    priceRange: [0, 200],
    minSamples: 1,
  };

  const DEFAULT_ANALISI: AnalisiConfig = {
    xAxis: 'price',
    yAxis: 'score',
    zones: [],
    foods: [],
  };

  const DEFAULT_HEATMAP: HeatmapConfig = {
    metric: 'count',
    xAxis: 'food',
    yAxis: 'zone',
    maxZones: 20,
    maxFoods: 15,
    minSamples: 3,
  };

  const [mapaFilters, setMapaFilters] = useState<MapaFilters>(initialFromUrl.mapaFilters);
  const [exploracioConfig, setExploracioConfig] = useState<ExploracioConfig>(initialFromUrl.exploracioConfig);
  const [analisiConfig, setAnalisiConfig] = useState<AnalisiConfig>(initialFromUrl.analisiConfig);
  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>(initialFromUrl.heatmapConfig);

  useEffect(() => {
    loadRestaurantData()
      .then((data) => {
        setAllData(data);
        const maxP = Math.ceil(Math.max(...data.filter((r) => r.price > 0).map((r) => r.price)));

        setExploracioConfig((prev) => ({
          ...prev,
          priceRange: [prev.priceRange[0], initialFromUrl.hasStoredPriceMax ? prev.priceRange[1] : maxP],
        }));

        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  const maxPrice = useMemo(
    () => Math.ceil(Math.max(...allData.filter((r) => r.price > 0).map((r) => r.price), 200)),
    [allData]
  );

  useEffect(() => {
    const params = serializeToParams(
      activeView,
      mapaFilters,
      exploracioConfig,
      analisiConfig,
      heatmapConfig,
      maxPrice
    );

    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? '?' + qs : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeView, mapaFilters, exploracioConfig, analisiConfig, heatmapConfig, maxPrice]);

  const filteredData = useMemo(() => {
    if (activeView === 'mapa') {
      return applyMapaFilters(
        allData,
        mapaFilters.zones,
        mapaFilters.foods,
        mapaFilters.ambients,
        mapaFilters.openLunch,
        mapaFilters.openDinner,
        mapaFilters.openWeekend
      );
    }

    if (activeView === 'exploracio') {
      return applyExploracioFilters(
        allData,
        exploracioConfig.zones,
        exploracioConfig.foods,
        exploracioConfig.ambients,
        exploracioConfig.priceRange
      );
    }

    if (activeView === 'analisi') {
      return applyAnalisiFilters(allData, analisiConfig.zones, analisiConfig.foods);
    }

    // heatmap starts from all data; aggregation and thresholds happen in the chart component
    return allData;
  }, [activeView, allData, mapaFilters, exploracioConfig, analisiConfig]);

  const updateMapaFilters = (patch: Partial<MapaFilters>) => setMapaFilters((prev) => ({ ...prev, ...patch }));
  const updateExploracioConfig = (patch: Partial<ExploracioConfig>) => setExploracioConfig((prev) => ({ ...prev, ...patch }));
  const updateAnalisiConfig = (patch: Partial<AnalisiConfig>) => setAnalisiConfig((prev) => ({ ...prev, ...patch }));
  const updateHeatmapConfig = (patch: Partial<HeatmapConfig>) => setHeatmapConfig((prev) => ({ ...prev, ...patch }));

  const resetViewToDefault = (view: ViewId) => {
    if (view === 'mapa') setMapaFilters(DEFAULT_MAPA);
    if (view === 'exploracio') setExploracioConfig({ ...DEFAULT_EXPLORACIO, priceRange: [0, maxPrice] });
    if (view === 'analisi') setAnalisiConfig(DEFAULT_ANALISI);
    if (view === 'heatmap') setHeatmapConfig(DEFAULT_HEATMAP);
  };

  // When switching views, clear the filters/variables of the view being abandoned.
  const setActiveView = (nextView: ViewId) => {
    if (nextView === activeView) return;
    resetViewToDefault(activeView);
    setActiveViewState(nextView);
  };

  const resetMapaFilters = () => setMapaFilters(DEFAULT_MAPA);
  const resetExploracioConfig = () => setExploracioConfig({ ...DEFAULT_EXPLORACIO, priceRange: [0, maxPrice] });
  const resetAnalisiConfig = () => setAnalisiConfig(DEFAULT_ANALISI);
  const resetHeatmapConfig = () => setHeatmapConfig(DEFAULT_HEATMAP);
  const resetAllPanels = () => {
    setMapaFilters(DEFAULT_MAPA);
    setExploracioConfig({ ...DEFAULT_EXPLORACIO, priceRange: [0, maxPrice] });
    setAnalisiConfig(DEFAULT_ANALISI);
    setHeatmapConfig(DEFAULT_HEATMAP);
  };

  return (
    <AppContext.Provider
      value={{
        allData,
        filteredData,
        loading,
        error,
        maxPrice,
        activeView,
        setActiveView,
        mapaFilters,
        updateMapaFilters,
        resetMapaFilters,
        exploracioConfig,
        updateExploracioConfig,
        resetExploracioConfig,
        analisiConfig,
        updateAnalisiConfig,
        resetAnalisiConfig,
        heatmapConfig,
        updateHeatmapConfig,
        resetHeatmapConfig,
        resetAllPanels,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
