import { BarChart2, Grid3X3, Map, ScatterChart } from 'lucide-react';
import { useApp, ViewId } from '../../context/AppContext';

const VIEWS: { id: ViewId; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: 'mapa', label: 'Mapa', desc: 'Distribucio geografica de restaurants', Icon: Map },
  { id: 'exploracio', label: 'Exploració', desc: 'Compara categories amb metriques', Icon: BarChart2 },
  { id: 'heatmap', label: 'Afinitat', desc: 'Compara dues dimensions de categories', Icon: Grid3X3 },
  { id: 'analisi', label: 'Anàlisi', desc: 'Correlacio entre variables numeriques', Icon: ScatterChart },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Visualitzacions</div>
      {VIEWS.map(({ id, label, desc, Icon }) => (
        <button
          key={id}
          className={`sidebar-item ${activeView === id ? 'active' : ''}`}
          onClick={() => setActiveView(id)}
        >
          <span className="sidebar-icon-wrap">
            <Icon size={17} strokeWidth={1.8} />
          </span>
          <span className="sidebar-text">
            <span className="sidebar-label">{label}</span>
            <span className="sidebar-desc">{desc}</span>
          </span>
        </button>
      ))}
    </aside>
  );
}
