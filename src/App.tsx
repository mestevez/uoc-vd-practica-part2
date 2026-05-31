import { useEffect, useState } from 'react';
import { loadRestaurantData, type Restaurant } from './lib/restaurantData';
import ScatterChart from './components/charts/ScatterChart';
import TopCuisineChart from './components/charts/TopCuisineChart';
import './styles.css';

export default function App() {
  const [data, setData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurantData()
      .then((restaurants) => {
        setData(restaurants);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ Restaurants de Barcelona</h1>
        <p className="subtitle">
          Anàlisi visual de {data.length > 0 ? data.length.toLocaleString('ca') : '…'} establiments
          gastronòmics de la ciutat
        </p>
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Carregant dades…</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>Error en carregar les dades: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="chart-section">
              <h2>Preu vs Puntuació</h2>
              <p className="chart-description">
                Cada cercle representa un restaurant. La mida del cercle és proporcional al nombre
                d'opinions i el color indica la puntuació (vermell = alta, groc = baixa).
              </p>
              <div className="chart-container">
                <ScatterChart data={data} />
              </div>
            </section>

            <section className="chart-section">
              <h2>Millors tipus de cuina per puntuació</h2>
              <p className="chart-description">
                Puntuació mitjana agrupada per tipus de cuina principal (top 12).
              </p>
              <div className="chart-container">
                <TopCuisineChart data={data} />
              </div>
            </section>

            <section className="stats-section">
              <h2>Estadístiques generals</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{data.length.toLocaleString('ca')}</span>
                  <span className="stat-label">Restaurants</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">
                    {(data.reduce((s, d) => s + d.score, 0) / data.length).toFixed(2)}
                  </span>
                  <span className="stat-label">Puntuació mitjana</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">
                    {(
                      data.filter((d) => d.price > 0).reduce((s, d) => s + d.price, 0) /
                      data.filter((d) => d.price > 0).length
                    ).toFixed(0)}{' '}
                    €
                  </span>
                  <span className="stat-label">Preu mitjà</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">
                    {new Set(data.map((d) => d.zone)).size}
                  </span>
                  <span className="stat-label">Zones de la ciutat</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Marc Estévez Amén · Visualització de Dades · Màster en Ciència de Dades · UOC ·{' '}
          {new Date().getFullYear()}
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.7 }}>
          Projecte assistit per GitHub Copilot (Claude Sonnet 4.6)
        </p>
      </footer>
    </div>
  );
}

