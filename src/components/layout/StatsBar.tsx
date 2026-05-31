import { useMemo } from 'react';
import { Restaurant } from '../../lib/restaurantData';

interface Props {
  data: Restaurant[];
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
}

export default function StatsBar({ data }: Props) {
  const stats = useMemo(() => {
    const withScore = data.filter((r) => r.score > 0);
    const withPrice = data.filter((r) => r.price > 0);
    return {
      total: data.length,
      avgScore: avg(withScore.map((r) => r.score)),
      avgPrice: avg(withPrice.map((r) => r.price)),
      zones: new Set(data.map((r) => r.zone)).size,
    };
  }, [data]);

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-val">{stats.total.toLocaleString('ca')}</span>
        <span className="stat-lbl">Restaurants</span>
      </div>
      <div className="stat-item">
        <span className="stat-val">{stats.avgScore.toFixed(2)}</span>
        <span className="stat-lbl">Puntuació mitjana</span>
      </div>
      <div className="stat-item">
        <span className="stat-val">{stats.avgPrice.toFixed(0)} €</span>
        <span className="stat-lbl">Preu mitjà</span>
      </div>
      <div className="stat-item">
        <span className="stat-val">{stats.zones}</span>
        <span className="stat-lbl">Zones</span>
      </div>
    </div>
  );
}

