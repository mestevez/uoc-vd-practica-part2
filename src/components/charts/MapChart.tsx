import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import { Restaurant } from '../../lib/restaurantData';

interface Props {
  data: Restaurant[];
}

const CENTRE: [number, number] = [41.3874, 2.1686];
const ZOOM = 13;

// ── Llegenda com a control natiu de Leaflet ───────────────────────────────────
function MapLegend() {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({ position: 'bottomleft' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = `
        <strong>Color = preu</strong>
        <span>🟡 Baix &rarr; 🔴 Alt</span>
        <strong style="margin-top:6px">Mida = puntuació</strong>
        <span>⬤ petita = baixa &nbsp;·&nbsp; gran = alta</span>
      `;
      // Evitar que el clic/scroll propagui al mapa
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      return div;
    };

    legend.addTo(map);
    return () => { legend.remove(); };
  }, [map]);

  return null;
}

// ── Component principal ───────────────────────────────────────────────────────
export default function MapChart({ data }: Props) {
  const { colorScale, rScale } = useMemo(() => {
    const prices = data.filter((r) => r.price > 0).map((r) => r.price);
    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([d3.min(prices) ?? 0, d3.max(prices) ?? 100]);
    const rScale = d3.scaleLinear().domain([0, 10]).range([4, 14]).clamp(true);
    return { colorScale, rScale };
  }, [data]);

  return (
    <MapContainer
      center={CENTRE}
      zoom={ZOOM}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapLegend />

      {data.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.latitude, r.longitude]}
          radius={rScale(r.score)}
          pathOptions={{
            fillColor: r.price > 0 ? colorScale(r.price) : '#94a3b8',
            fillOpacity: 0.82,
            color: 'rgba(255,255,255,0.7)',
            weight: 0.8,
          }}
        >
          <Popup maxWidth={260}>
            <strong>{r.name}</strong>
            <div>📍 {r.zone}</div>
            <div>🍽️ {r.food.split(',').slice(0, 2).map((f) => f.trim()).join(', ')}</div>
            <div>⭐ {r.score.toFixed(2)} &nbsp;·&nbsp; 💬 {r.opinions_count} opinions</div>
            {r.price > 0 && <div>💶 {r.price} €</div>}
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>{r.address}</div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
