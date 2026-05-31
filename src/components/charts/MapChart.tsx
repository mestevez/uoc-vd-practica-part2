import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Restaurant } from '../../lib/restaurantData';

interface Props {
  data: Restaurant[];
}

interface Popup {
  restaurant: Restaurant;
  x: number;
  y: number;
}

const PRICE_COLOR = d3.scaleSequential(d3.interpolateYlOrRd);
const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };

export default function MapChart({ data }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [popup, setPopup] = useState<Popup | null>(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !wrapRef.current || data.length === 0) return;

    const wrap = wrapRef.current;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    const g = d3.select(gRef.current);

    // Clear previous render
    g.selectAll('*').remove();

    // Scales based on coordinates
    const lngs = data.map((r) => r.longitude);
    const lats = data.map((r) => r.latitude);
    const prices = data.filter((r) => r.price > 0).map((r) => r.price);

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(lngs)! - 0.005, d3.max(lngs)! + 0.005])
      .range([MARGIN.left, width - MARGIN.right]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(lats)! - 0.005, d3.max(lats)! + 0.005])
      .range([height - MARGIN.bottom, MARGIN.top]);

    const colorScale = PRICE_COLOR.copy().domain([d3.min(prices)!, d3.max(prices)!]);

    const rScale = d3.scaleLinear().domain([0, 10]).range([3, 10]).clamp(true);

    // Background
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#e8f4f8')
      .attr('rx', 4);

    // Dots
    g.selectAll<SVGCircleElement, Restaurant>('circle')
      .data(data, (d) => d.id)
      .join('circle')
      .attr('cx', (d) => xScale(d.longitude))
      .attr('cy', (d) => yScale(d.latitude))
      .attr('r', (d) => rScale(d.score))
      .attr('fill', (d) => (d.price > 0 ? colorScale(d.price) : '#aaa'))
      .attr('stroke', 'rgba(255,255,255,0.6)')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, d) => {
        event.stopPropagation();
        const rect = (svgRef.current as SVGSVGElement).getBoundingClientRect();
        setPopup({ restaurant: d, x: event.clientX - rect.left, y: event.clientY - rect.top });
      });

    // Zoom behaviour
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 30])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    d3.select(svgRef.current)
      .call(zoom)
      .on('click.clear', () => setPopup(null));

    return () => {
      d3.select(svgRef.current).on('.zoom', null).on('click.clear', null);
    };
  }, [data]);

  return (
    <div ref={wrapRef} className="map-wrap">
      {/* Legend */}
      <div className="map-legend">
        <span>🔴 Preu alt</span>
        <span>🟡 Preu baix</span>
        <span>⬤ grandària = puntuació</span>
      </div>

      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }}>
        <g ref={gRef} />
      </svg>

      {popup && (
        <div
          className="map-popup"
          style={{
            left: Math.min(popup.x + 12, (wrapRef.current?.clientWidth ?? 600) - 220),
            top: Math.max(popup.y - 80, 8),
          }}
        >
          <button className="map-popup-close" onClick={() => setPopup(null)}>✕</button>
          <strong>{popup.restaurant.name}</strong>
          <div className="popup-row">📍 {popup.restaurant.zone}</div>
          <div className="popup-row">🍽️ {popup.restaurant.food.split(',').slice(0, 2).join(', ')}</div>
          <div className="popup-row">⭐ {popup.restaurant.score.toFixed(2)} · 💬 {popup.restaurant.opinions_count}</div>
          {popup.restaurant.price > 0 && (
            <div className="popup-row">💶 {popup.restaurant.price} €</div>
          )}
          <div className="popup-row small">{popup.restaurant.address}</div>
        </div>
      )}
    </div>
  );
}

