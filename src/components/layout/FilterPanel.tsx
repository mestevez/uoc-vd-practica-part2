import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  useApp,
  ExploracioXAxis,
  ExploracioYAxis,
  AnalisiAxis,
  HeatMetric,
  HeatmapCategoryAxis,
} from '../../context/AppContext';
import { getUniqueZones, getUniqueFoodTypes, getUniqueAmbients } from '../../lib/restaurantData';
import MultiSelect from '../ui/MultiSelect';
import RangeSlider from '../ui/RangeSlider';

const X_OPTIONS_EXPLORACIO: { value: ExploracioXAxis; label: string }[] = [
  { value: 'zone', label: 'Zona' },
  { value: 'food', label: 'Tipus de menjar' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'restaurant', label: 'Restaurant (top 20)' },
];

const Y_OPTIONS_EXPLORACIO: { value: ExploracioYAxis; label: string }[] = [
  { value: 'count', label: 'Nombre de restaurants' },
  { value: 'score', label: 'Puntuacio' },
  { value: 'price', label: 'Preu mitja' },
  { value: 'opinions', label: "Nombre d'opinions" },
];

const AXIS_OPTIONS_ANALISI: { value: AnalisiAxis; label: string }[] = [
  { value: 'price', label: 'Preu mitja' },
  { value: 'score', label: 'Puntuacio' },
  { value: 'opinions', label: "Nombre d'opinions" },
  { value: 'dist', label: 'Distancia al centre' },
  { value: 'renda', label: 'Renda mitjana bruta' },
];

const METRIC_OPTIONS: { value: HeatMetric; label: string }[] = [
  { value: 'count', label: 'Nombre de restaurants' },
  { value: 'score', label: 'Puntuacio' },
  { value: 'price', label: 'Preu' },
];

const HEAT_AXIS_OPTIONS: { value: HeatmapCategoryAxis; label: string }[] = [
  { value: 'zone', label: 'Zona' },
  { value: 'food', label: 'Tipus de cuina' },
  { value: 'ambient', label: 'Ambient' },
];

function SectionTitle({ children }: { children: string }) {
  return <div className="filter-section-title">{children}</div>;
}

export default function FilterPanel() {
  const {
    allData,
    activeView,
    maxPrice,
    resetAllPanels,

    mapaFilters,
    updateMapaFilters,

    exploracioConfig,
    updateExploracioConfig,

    analisiConfig,
    updateAnalisiConfig,

    heatmapConfig,
    updateHeatmapConfig,
  } = useApp();

  const zones = useMemo(() => getUniqueZones(allData), [allData]);
  const foods = useMemo(() => getUniqueFoodTypes(allData), [allData]);
  const ambients = useMemo(() => getUniqueAmbients(allData), [allData]);

  return (
    <aside className="filter-panel">

      {activeView === 'mapa' && (
        <>
          <SectionTitle>Filtres</SectionTitle>
          <MultiSelect label="Zona" options={zones} selected={mapaFilters.zones} onChange={(v) => updateMapaFilters({ zones: v })} />
          <MultiSelect label="Tipus de menjar" options={foods} selected={mapaFilters.foods} onChange={(v) => updateMapaFilters({ foods: v })} />
          <MultiSelect label="Ambient" options={ambients} selected={mapaFilters.ambients} onChange={(v) => updateMapaFilters({ ambients: v })} />

          <div className="filter-group">
            <label className="filter-label">Horaris</label>
            <div className="filter-checks">
              <label className="filter-check">
                <input type="checkbox" checked={mapaFilters.openLunch} onChange={(e) => updateMapaFilters({ openLunch: e.target.checked })} />
                <span>Obert a dinar</span>
              </label>
              <label className="filter-check">
                <input type="checkbox" checked={mapaFilters.openDinner} onChange={(e) => updateMapaFilters({ openDinner: e.target.checked })} />
                <span>Obert a sopar</span>
              </label>
              <label className="filter-check">
                <input type="checkbox" checked={mapaFilters.openWeekend} onChange={(e) => updateMapaFilters({ openWeekend: e.target.checked })} />
                <span>Obert cap de setmana</span>
              </label>
            </div>
          </div>
        </>
      )}

      {activeView === 'exploracio' && (
        <>
          <SectionTitle>Variables</SectionTitle>

          <div className="filter-group">
            <label className="filter-label">Eix X</label>
            <select className="filter-select" value={exploracioConfig.xAxis} onChange={(e) => updateExploracioConfig({ xAxis: e.target.value as ExploracioXAxis })}>
              {X_OPTIONS_EXPLORACIO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Eix Y</label>
            <select className="filter-select" value={exploracioConfig.yAxis} onChange={(e) => updateExploracioConfig({ yAxis: e.target.value as ExploracioYAxis })}>
              {Y_OPTIONS_EXPLORACIO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-divider" />
          <SectionTitle>Filtres</SectionTitle>

          <MultiSelect label="Zona" options={zones} selected={exploracioConfig.zones} onChange={(v) => updateExploracioConfig({ zones: v })} />
          <MultiSelect label="Tipus de menjar" options={foods} selected={exploracioConfig.foods} onChange={(v) => updateExploracioConfig({ foods: v })} />
          <MultiSelect label="Ambient" options={ambients} selected={exploracioConfig.ambients} onChange={(v) => updateExploracioConfig({ ambients: v })} />

          <RangeSlider label="Preu (€)" min={0} max={maxPrice} value={exploracioConfig.priceRange} onChange={(v) => updateExploracioConfig({ priceRange: v })} />

          <div className="filter-group">
            <label className="filter-label">Minim de restaurants per categoria</label>
            <div className="min-samples-control">
              <input
                type="range"
                min={1}
                max={50}
                value={exploracioConfig.minSamples}
                onChange={(e) => updateExploracioConfig({ minSamples: +e.target.value })}
                className="range-thumb"
                style={{ position: 'static', width: '100%', appearance: 'auto', pointerEvents: 'auto', height: '20px' }}
              />
              <div className="min-samples-value">{'>= '}<strong>{exploracioConfig.minSamples}</strong> restaurants</div>
            </div>
          </div>
        </>
      )}

      {activeView === 'heatmap' && (
        <>
          <SectionTitle>Variables</SectionTitle>

          <div className="filter-group">
            <label className="filter-label">Eix X (categoria)</label>
            <select className="filter-select" value={heatmapConfig.xAxis} onChange={(e) => updateHeatmapConfig({ xAxis: e.target.value as HeatmapCategoryAxis })}>
              {HEAT_AXIS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Eix Y (categoria)</label>
            <select className="filter-select" value={heatmapConfig.yAxis} onChange={(e) => updateHeatmapConfig({ yAxis: e.target.value as HeatmapCategoryAxis })}>
              {HEAT_AXIS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Metrica</label>
            <select className="filter-select" value={heatmapConfig.metric} onChange={(e) => updateHeatmapConfig({ metric: e.target.value as HeatMetric })}>
              {METRIC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-divider" />
          <SectionTitle>Filtres</SectionTitle>

          <div className="filter-group">
            <label className="filter-label">Maxim de categories Y (files)</label>
            <div className="min-samples-control">
              <input type="range" min={8} max={40} value={heatmapConfig.maxZones}
                onChange={(e) => updateHeatmapConfig({ maxZones: +e.target.value })}
                className="range-thumb" style={{ position: 'static', width: '100%', appearance: 'auto', pointerEvents: 'auto', height: '20px' }}
              />
              <div className="min-samples-value">{heatmapConfig.maxZones}</div>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Maxim de categories X (columnes)</label>
            <div className="min-samples-control">
              <input type="range" min={6} max={30} value={heatmapConfig.maxFoods}
                onChange={(e) => updateHeatmapConfig({ maxFoods: +e.target.value })}
                className="range-thumb" style={{ position: 'static', width: '100%', appearance: 'auto', pointerEvents: 'auto', height: '20px' }}
              />
              <div className="min-samples-value">{heatmapConfig.maxFoods}</div>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Mostra minima per cel·la</label>
            <div className="min-samples-control">
              <input type="range" min={1} max={20} value={heatmapConfig.minSamples}
                onChange={(e) => updateHeatmapConfig({ minSamples: +e.target.value })}
                className="range-thumb" style={{ position: 'static', width: '100%', appearance: 'auto', pointerEvents: 'auto', height: '20px' }}
              />
              <div className="min-samples-value">{'>= '}{heatmapConfig.minSamples}</div>
            </div>
          </div>
        </>
      )}

      {activeView === 'analisi' && (
        <>
          <SectionTitle>Variables</SectionTitle>

          <div className="filter-group">
            <label className="filter-label">Eix X</label>
            <select className="filter-select" value={analisiConfig.xAxis} onChange={(e) => updateAnalisiConfig({ xAxis: e.target.value as AnalisiAxis })}>
              {AXIS_OPTIONS_ANALISI.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Eix Y</label>
            <select className="filter-select" value={analisiConfig.yAxis} onChange={(e) => updateAnalisiConfig({ yAxis: e.target.value as AnalisiAxis })}>
              {AXIS_OPTIONS_ANALISI.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="filter-divider" />
          <SectionTitle>Filtres</SectionTitle>
          <MultiSelect label="Zona" options={zones} selected={analisiConfig.zones} onChange={(v) => updateAnalisiConfig({ zones: v })} />
          <MultiSelect label="Tipus de menjar" options={foods} selected={analisiConfig.foods} onChange={(v) => updateAnalisiConfig({ foods: v })} />
        </>
      )}

      <div className="filter-panel-footer">
        <button className="filter-reset-btn filter-reset-btn-global" onClick={resetAllPanels}>
          <RotateCcw size={13} /> Netejar configuració global
        </button>
      </div>
    </aside>
  );
}

