import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Restaurant, primaryFood, primaryAmbient } from '../../lib/restaurantData';
import { HeatMetric, HeatmapCategoryAxis } from '../../context/AppContext';

interface Props {
  data: Restaurant[];
  metric: HeatMetric;
  xAxis: HeatmapCategoryAxis;
  yAxis: HeatmapCategoryAxis;
  maxZones: number;
  maxFoods: number;
  minSamples: number;
}

type Cell = {
  xKey: string;
  yKey: string;
  count: number;
  score: number;
  price: number;
  value: number;
};

function valueForMetric(c: Cell, metric: HeatMetric): number {
  if (metric === 'count') return c.count;
  if (metric === 'score') return c.score;
  return c.price;
}

const METRIC_LABEL: Record<HeatMetric, string> = {
  count: 'Nombre de restaurants',
  score: 'Puntuacio mitjana',
  price: 'Preu mitja',
};

function catValue(r: Restaurant, axis: HeatmapCategoryAxis): string {
  if (axis === 'zone') return r.zone;
  if (axis === 'food') return primaryFood(r);
  return primaryAmbient(r);
}

const AXIS_LABEL: Record<HeatmapCategoryAxis, string> = {
  zone: 'Zona',
  food: 'Tipus de cuina',
  ambient: 'Ambient',
};

const MARGIN = { top: 120, right: 40, bottom: 40, left: 170 };

export default function ZoneFoodHeatmap({
  data,
  metric,
  xAxis,
  yAxis,
  maxZones,
  maxFoods,
  minSamples,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const container = svgRef.current.parentElement!;
    const width = container.clientWidth - MARGIN.left - MARGIN.right;
    const height = Math.max(container.clientHeight - MARGIN.top - MARGIN.bottom, 320);

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', height + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const yDomain = d3
      .rollups(data, (v) => v.length, (d) => catValue(d, yAxis))
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxZones)
      .map((d) => d[0]);

    const xDomain = d3
      .rollups(data, (v) => v.length, (d) => catValue(d, xAxis))
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxFoods)
      .map((d) => d[0]);

    const filtered = data.filter((d) => yDomain.includes(catValue(d, yAxis)) && xDomain.includes(catValue(d, xAxis)));

    const grouped = d3.rollup(
      filtered,
      (v) => ({
        count: v.length,
        score: d3.mean(v, (d) => d.score) ?? 0,
        price: d3.mean(v.filter((d) => d.price > 0), (d) => d.price) ?? 0,
      }),
      (d) => catValue(d, yAxis),
      (d) => catValue(d, xAxis)
    );

    const cells: Cell[] = [];
    yDomain.forEach((yKey) => {
      xDomain.forEach((xKey) => {
        const g = grouped.get(yKey)?.get(xKey);
        if (!g) return;
        if (g.count < minSamples) return;
        const c: Cell = { xKey, yKey, ...g, value: 0 };
        c.value = valueForMetric(c, metric);
        cells.push(c);
      });
    });

    if (cells.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .text('No hi ha dades per aquests filtres / llindars');
      return;
    }

    const x = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.04);
    const y = d3.scaleBand().domain(yDomain).range([0, height]).padding(0.04);

    const vExtent = d3.extent(cells, (d) => d.value) as [number, number];
    const color = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([vExtent[0], vExtent[1] || vExtent[0] + 1]);

    svg
      .append('g')
      .call(d3.axisTop(x))
      .selectAll('text')
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'start')
      .attr('dx', '0.2em')
      .attr('dy', '-0.2em')
      .attr('font-size', '11px');

    svg.append('g').call(d3.axisLeft(y)).selectAll('text').attr('font-size', '11px');

    svg.selectAll('.domain').attr('stroke', '#cbd5e1');
    svg.selectAll('.tick line').attr('stroke', '#e2e8f0');

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(255,255,255,0.98)')
      .style('border', '1px solid #cbd5e1')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    svg
      .selectAll('rect.cell')
      .data(cells)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', (d) => x(d.xKey) ?? 0)
      .attr('y', (d) => y(d.yKey) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d) => color(d.value))
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(120).style('opacity', 1);
        tooltip.html(
          `<strong>${AXIS_LABEL[yAxis]}: ${d.yKey}</strong><br/>` +
            `<strong>${AXIS_LABEL[xAxis]}: ${d.xKey}</strong><br/>` +
            `Restaurants: <strong>${d.count}</strong><br/>` +
            `Puntuacio mitjana: <strong>${d.score.toFixed(2)}</strong><br/>` +
            `Preu mitja: <strong>${d.price.toFixed(1)}€</strong><br/>` +
            `${METRIC_LABEL[metric]}: <strong>${d.value.toFixed(metric === 'count' ? 0 : 2)}</strong>`
        );
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${(event as MouseEvent).pageX + 12}px`).style('top', `${(event as MouseEvent).pageY - 26}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(120).style('opacity', 0));

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', -98)
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .attr('fill', '#0f172a')
      .text(`Heatmap ${AXIS_LABEL[yAxis]} × ${AXIS_LABEL[xAxis]}`);

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', -78)
      .attr('font-size', '12px')
      .attr('fill', '#64748b')
      .text(`${METRIC_LABEL[metric]} · minim ${minSamples} restaurants per cel·la`);

    const legendW = 160;
    const legendH = 10;
    const legendX = width - legendW;
    const legendY = -96;

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'hf-grad');
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      grad.append('stop').attr('offset', `${t * 100}%`).attr('stop-color', d3.interpolateYlOrRd(t));
    });

    svg
      .append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('fill', 'url(#hf-grad)')
      .attr('rx', 3);

    svg
      .append('text')
      .attr('x', legendX)
      .attr('y', legendY - 4)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(vExtent[0].toFixed(metric === 'count' ? 0 : 1));

    svg
      .append('text')
      .attr('x', legendX + legendW)
      .attr('y', legendY - 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(vExtent[1].toFixed(metric === 'count' ? 0 : 1));

    return () => {
      tooltip.remove();
    };
  }, [data, metric, xAxis, yAxis, maxZones, maxFoods, minSamples]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}
