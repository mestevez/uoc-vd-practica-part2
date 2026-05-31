import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Restaurant, primaryFood, primaryAmbient } from '../../lib/restaurantData';
import { ExploracioXAxis, ExploracioYAxis } from '../../context/AppContext';

interface Props {
  data: Restaurant[];
  xAxis: ExploracioXAxis;
  yAxis: ExploracioYAxis;
  minSamples: number;
}

const X_LABELS: Record<ExploracioXAxis, string> = {
  zone: 'Zona',
  food: 'Tipus de menjar',
  ambient: 'Ambient',
  restaurant: 'Restaurant',
};

const Y_LABELS: Record<ExploracioYAxis, string> = {
  price: 'Preu mitjà (€)',
  score: 'Puntuació mitjana',
  opinions: 'Opinions (mitjana)',
};

function getXValue(r: Restaurant, xAxis: ExploracioXAxis): string {
  if (xAxis === 'zone') return r.zone;
  if (xAxis === 'food') return primaryFood(r);
  if (xAxis === 'ambient') return primaryAmbient(r);
  return r.name;
}

function getYValue(r: Restaurant, yAxis: ExploracioYAxis): number {
  if (yAxis === 'price') return r.price;
  if (yAxis === 'score') return r.score;
  return r.opinions_count;
}

const MAX_BARS = 20;
const MARGIN = { top: 40, right: 20, bottom: 120, left: 70 };

export default function BarChart({ data, xAxis, yAxis, minSamples }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const container = svgRef.current.parentElement!;
    const width = container.clientWidth - MARGIN.left - MARGIN.right;
    const height = Math.max(container.clientHeight - MARGIN.top - MARGIN.bottom, 200);

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', height + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Aggregate: average + count per category, filtered by minSamples
    // Per a restaurants, cada entrada és única (n=1), no s'aplica filtre de mostres
    const isRestaurant = xAxis === 'restaurant';
    const valid = data.filter((r) => getYValue(r, yAxis) > 0 && getXValue(r, xAxis).trim() !== '');
    const grouped = d3.rollup(
      valid,
      (v) => ({ mean: d3.mean(v, (r) => getYValue(r, yAxis)) ?? 0, count: v.length }),
      (r) => getXValue(r, xAxis)
    );

    const chartData = [...grouped.entries()]
      .map(([key, val]) => ({ key, mean: val.mean, count: val.count }))
      .filter((d) => isRestaurant || d.count >= minSamples)
      .sort((a, b) => b.mean - a.mean)
      .slice(0, MAX_BARS);

    if (chartData.length === 0) {
      svg.append('text').attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle').attr('fill', '#999').text('Sense dades');
      return;
    }

    const x = d3.scaleBand().domain(chartData.map((d) => d.key)).range([0, width]).padding(0.3);
    const minY = d3.min(chartData, (d) => d.mean)!;
    const maxY = d3.max(chartData, (d) => d.mean)!;

    // Escala Y adaptada per variable:
    // - score: domini truncat al rang real per maximitzar la discriminació visual
    // - opinions: logarítmica (abasta ordres de magnitud molt diferents)
    // - price: lineal des de 0
    let y: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
    let yFloor = 0;

    if (yAxis === 'opinions') {
      const safeMin = Math.max(1, minY);
      y = d3.scaleLog().domain([safeMin * 0.8, maxY * 1.1]).range([height, 0]).clamp(true);
    } else if (yAxis === 'score') {
      yFloor = Math.max(0, minY - (maxY - minY) * 1.5);
      y = d3.scaleLinear().domain([yFloor, maxY]).nice().range([height, 0]);
    } else {
      y = d3.scaleLinear().domain([0, maxY]).nice().range([height, 0]);
    }

    const isLog = yAxis === 'opinions';
    const BAR_COLOR = '#3b82f6';

    // Grid
    svg.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y as d3.ScaleLinear<number,number>).tickSize(-width).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3'));

    // Eix X
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em')
      .attr('font-size', '11px');

    // Eix Y
    const yAxis_ = isLog
      ? d3.axisLeft(y as d3.ScaleLogarithmic<number,number>).ticks(5, '~s')
      : d3.axisLeft(y as d3.ScaleLinear<number,number>).ticks(6);
    svg.append('g').call(yAxis_);

    // Indicació d'eix truncat (només per puntuació)
    if (!isLog && yFloor > 0) {
      svg.append('text').attr('x', -6).attr('y', height + 2)
        .attr('text-anchor', 'end').attr('font-size', '9px').attr('fill', '#94a3b8')
        .text('⚠ eix truncat');
      const zz = [0, 5, -5, 5, 0];
      const zzPath = zz.map((dy, i) => `${i === 0 ? 'M' : 'L'}${i * 6},${height + dy}`).join(' ');
      svg.append('path').attr('d', zzPath).attr('stroke', '#94a3b8').attr('stroke-width', 1.5).attr('fill', 'none');
    }

    // Labels d'eixos
    svg.append('text').attr('x', width / 2).attr('y', height + MARGIN.bottom - 10)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text(X_LABELS[xAxis]);
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -55)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text(isLog ? `${Y_LABELS[yAxis]} (escala log)` : Y_LABELS[yAxis]);
    svg.append('text').attr('x', width / 2).attr('y', -20)
      .attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold').attr('fill', '#222')
      .text(`${Y_LABELS[yAxis]} per ${X_LABELS[xAxis]}`);


    // Tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip')
      .style('position', 'absolute').style('background', 'rgba(255,255,255,0.95)')
      .style('border', '1px solid #ccc').style('border-radius', '6px')
      .style('padding', '7px 11px').style('font-size', '12px')
      .style('pointer-events', 'none').style('opacity', 0);

    // Barres
    svg.selectAll('rect.bar').data(chartData).join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.key)!)
      .attr('y', (d) => (y as (v: number) => number)(d.mean))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - (y as (v: number) => number)(d.mean))
      .attr('fill', BAR_COLOR)
      .attr('opacity', (d) => (isRestaurant || d.count >= minSamples) ? 1 : 0.3)
      .attr('rx', 3)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(100).style('opacity', 1);
        const reliable = d.count >= minSamples;
        tooltip.html(
          `<strong>${d.key}</strong><br/>` +
          `${Y_LABELS[yAxis]}: <strong>${d.mean.toFixed(2)}</strong><br/>` +
          `Mostres: <strong>${d.count}</strong> restaurants` +
          (!reliable ? `<br/><span style="color:#f59e0b">⚠ mostra petita, valor poc fiable</span>` : '')
        );
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${(event as MouseEvent).pageX + 14}px`)
          .style('top', `${(event as MouseEvent).pageY - 28}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

    // Etiquetes n= sobre cada barra (no per a restaurants individuals)
    if (!isRestaurant) {
    svg.selectAll('text.n-label').data(chartData).join('text')
      .attr('class', 'n-label')
      .attr('x', (d) => x(d.key)! + x.bandwidth() / 2)
      .attr('y', (d) => (y as (v: number) => number)(d.mean) - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', (d) => d.count >= minSamples ? '#475569' : '#f59e0b')
      .attr('font-weight', (d) => d.count < minSamples ? '700' : '400')
      .text((d) => `n=${d.count}`);
    }

    return () => { tooltip.remove(); };
  }, [data, xAxis, yAxis, minSamples]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}

