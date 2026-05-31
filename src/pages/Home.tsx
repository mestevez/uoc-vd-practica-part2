import { useApp } from '../context/AppContext';
import StatsBar from '../components/layout/StatsBar';
import Sidebar from '../components/layout/Sidebar';
import FilterPanel from '../components/layout/FilterPanel';
import MapChart from '../components/charts/MapChart';
import BarChart from '../components/charts/BarChart';
import ScatterPlot from '../components/charts/ScatterPlot';

export default function Home() {
  const {
    filteredData,
    loading,
    error,
    activeView,
    exploracioConfig,
    analisiConfig,
  } = useApp();

  return (
    <div className="app-shell">
      <StatsBar data={filteredData} />

      <div className="app-body">
        <Sidebar />

        <main className="app-main">
          {loading && (
            <div className="centered">
              <div className="spinner" />
              <p>Carregant dades…</p>
            </div>
          )}

          {error && (
            <div className="error-box">
              <p>Error en carregar les dades: {error}</p>
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

