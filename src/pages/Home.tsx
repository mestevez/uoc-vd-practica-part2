import { useApp } from '../context/AppContext';
import StatsBar from '../components/layout/StatsBar';
import Sidebar from '../components/layout/Sidebar';
import FilterPanel from '../components/layout/FilterPanel';
import MapChart from '../components/charts/MapChart';
import BarChart from '../components/charts/BarChart';
import ZoneFoodHeatmap from '../components/charts/ZoneFoodHeatmap';
import ScatterPlot from '../components/charts/ScatterPlot';
import { UtensilsCrossed } from 'lucide-react';

export default function Home() {
  const {
    filteredData,
    allData,
    loading,
    error,
    activeView,
    exploracioConfig,
    analisiConfig,
    heatmapConfig,
  } = useApp();

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-icon">
          <UtensilsCrossed size={17} strokeWidth={2.2} />
        </div>
        <span className="app-header-title">Restaurants de Barcelona</span>
        <span className="app-header-subtitle">
          {allData.length > 0 ? `${allData.length.toLocaleString('ca')} establiments · Visualització de dades` : ''}
        </span>
      </header>

      {/* Stats */}
      <StatsBar data={filteredData} />

      {/* Body */}
      <div className="app-body">
        <Sidebar />

        <main className="app-main">
          {loading && (
            <div className="centered">
              <div className="spinner" />
              <p>Carregant dades...</p>
            </div>
          )}
          {error && (
            <div className="error-box">
              <p>Error: {error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="chart-area">
              {activeView === 'mapa' && <MapChart data={filteredData} />}

              {activeView === 'exploracio' && (
                <BarChart
                  data={filteredData}
                  xAxis={exploracioConfig.xAxis}
                  yAxis={exploracioConfig.yAxis}
                  minSamples={exploracioConfig.minSamples}
                />
              )}

              {activeView === 'heatmap' && (
                <ZoneFoodHeatmap
                  data={allData}
                  metric={heatmapConfig.metric}
                  xAxis={heatmapConfig.xAxis}
                  yAxis={heatmapConfig.yAxis}
                  maxZones={heatmapConfig.maxZones}
                  maxFoods={heatmapConfig.maxFoods}
                  minSamples={heatmapConfig.minSamples}
                />
              )}

              {activeView === 'analisi' && (
                <ScatterPlot
                  data={filteredData}
                  xAxis={analisiConfig.xAxis}
                  yAxis={analisiConfig.yAxis}
                />
              )}
            </div>
          )}
        </main>

        <FilterPanel />
      </div>
    </div>
  );
}
