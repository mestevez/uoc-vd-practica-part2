import { useApp, ViewId } from '../../context/AppContext';

const VIEWS: { id: ViewId; label: string; icon: string; description: string }[] = [
  { id: 'mapa', label: 'Mapa', icon: '🗺️', description: 'Distribució geogràfica' },
  { id: 'exploracio', label: 'Exploració', icon: '📊', description: 'Gràfic de barres' },
  { id: 'analisi', label: 'Anàlisi', icon: '🔍', description: 'Correlació de variables' },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Visualitzacions</div>
      <nav>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={`sidebar-item ${activeView === v.id ? 'active' : ''}`}
            onClick={() => setActiveView(v.id)}
          >
            <span className="sidebar-icon">{v.icon}</span>
            <span className="sidebar-text">
              <span className="sidebar-label">{v.label}</span>
              <span className="sidebar-desc">{v.description}</span>
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

