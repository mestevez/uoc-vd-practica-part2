import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { loadRestaurantData, Restaurant } from '../lib/restaurantData';
import {
  applyMapaFilters,
  applyExploracioFilters,
  applyAnalisiFilters,
} from '../lib/filterUtils';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ViewId = 'mapa' | 'exploracio' | 'analisi';
export type ExploracioXAxis = 'zone' | 'food' | 'ambient' | 'restaurant';
export type ExploracioYAxis = 'price' | 'score' | 'opinions' | 'count';
export type AnalisiAxis = 'price' | 'score' | 'opinions' | 'dist' | 'renda';

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

// ── Context value ─────────────────────────────────────────────────────────────

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
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewId>('mapa');

  const DEFAULT_MAPA: MapaFilters = {
    zones: [], foods: [], ambients: [],
    openLunch: false, openDinner: false, openWeekend: false,
  };

  const [mapaFilters, setMapaFilters] = useState<MapaFilters>(DEFAULT_MAPA);

  const DEFAULT_EXPLORACIO: ExploracioConfig = {
    xAxis: 'zone', yAxis: 'score',
    zones: [], foods: [], ambients: [],
    priceRange: [0, 200], minSamples: 1,
  };

  const [exploracioConfig, setExploracioConfig] = useState<ExploracioConfig>(DEFAULT_EXPLORACIO);

  const DEFAULT_ANALISI: AnalisiConfig = { xAxis: 'price', yAxis: 'score', zones: [], foods: [] };

  const [analisiConfig, setAnalisiConfig] = useState<AnalisiConfig>(DEFAULT_ANALISI);

  // Sync priceRange max once data loads
  useEffect(() => {
    loadRestaurantData()
      .then((data) => {
        setAllData(data);
        const maxP = Math.ceil(Math.max(...data.filter((r) => r.price > 0).map((r) => r.price)));
        setExploracioConfig((prev) => ({ ...prev, priceRange: [0, maxP] }));
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

  const filteredData = useMemo(() => {
    if (activeView === 'mapa')
      return applyMapaFilters(
        allData,
        mapaFilters.zones,
        mapaFilters.foods,
        mapaFilters.ambients,
        mapaFilters.openLunch,
        mapaFilters.openDinner,
        mapaFilters.openWeekend
      );
    if (activeView === 'exploracio')
      return applyExploracioFilters(
        allData,
        exploracioConfig.zones,
        exploracioConfig.foods,
        exploracioConfig.ambients,
        exploracioConfig.priceRange
      );
    if (activeView === 'analisi')
      return applyAnalisiFilters(allData, analisiConfig.zones, analisiConfig.foods);
    return allData;
  }, [activeView, allData, mapaFilters, exploracioConfig, analisiConfig]);

  const updateMapaFilters = (patch: Partial<MapaFilters>) =>
    setMapaFilters((prev) => ({ ...prev, ...patch }));

  const updateExploracioConfig = (patch: Partial<ExploracioConfig>) =>
    setExploracioConfig((prev) => ({ ...prev, ...patch }));

  const updateAnalisiConfig = (patch: Partial<AnalisiConfig>) =>
    setAnalisiConfig((prev) => ({ ...prev, ...patch }));

  const resetMapaFilters = () => setMapaFilters(DEFAULT_MAPA);
  const resetExploracioConfig = () =>
    setExploracioConfig({ ...DEFAULT_EXPLORACIO, priceRange: [0, maxPrice] });
  const resetAnalisiConfig = () => setAnalisiConfig(DEFAULT_ANALISI);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

