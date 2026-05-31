import { BarChart2, Map, ScatterChart } from 'lucide-react';
import { useApp, ViewId } from '../../context/AppContext';

const VIEWS: { id: ViewId; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: 'mapa',       label: 'Mapa',       desc: 'Distribució geogràfica', Icon: Map         },
  { id: 'exploracio', label: 'Exploració', desc: 'Gràfic de barres',       Icon: BarChart2   },
  { id: 'analisi',    label: 'Anàlisi',    desc: 'Correlació de variables', Icon: ScatterChart },
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
