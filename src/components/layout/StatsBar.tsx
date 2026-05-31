import { useMemo } from 'react';
import { Store, Star, Euro, MapPin } from 'lucide-react';
import { Restaurant } from '../../lib/restaurantData';

interface Props { data: Restaurant[]; }

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
}

const CARDS = [
  { key: 'total',    label: 'Restaurants',      icon: Store,  color: 'red'   },
  { key: 'avgScore', label: 'Puntuació mitjana', icon: Star,   color: 'amber' },
  { key: 'avgPrice', label: 'Preu mitjà',        icon: Euro,   color: 'blue'  },
  { key: 'zones',    label: 'Zones',             icon: MapPin, color: 'green' },
] as const;

export default function StatsBar({ data }: Props) {
  const stats = useMemo(() => {
    const withScore = data.filter((r) => r.score > 0);
    const withPrice = data.filter((r) => r.price > 0);
    return {
      total:    data.length.toLocaleString('ca'),
      avgScore: avg(withScore.map((r) => r.score)).toFixed(2),
      avgPrice: avg(withPrice.map((r) => r.price)).toFixed(0) + ' €',
      zones:    new Set(data.map((r) => r.zone)).size.toString(),
    };
  }, [data]);

  return (
    <div className="stats-bar">
      {CARDS.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="stat-card">
          <div className={`stat-icon ${color}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="stat-info">
            <div className="stat-val">{stats[key]}</div>
            <div className="stat-lbl">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
