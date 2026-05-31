import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Restaurant } from '../../lib/restaurantData';
import { AnalisiAxis } from '../../context/AppContext';

interface Props {
  data: Restaurant[];
  xAxis: AnalisiAxis;
  yAxis: AnalisiAxis;
}

const AXIS_LABELS: Record<AnalisiAxis, string> = {
  price: 'Preu (€)',
  score: 'Puntuació',
  opinions: 'Nombre d\'opinions',
  dist: 'Distància al centre (km)',
  renda: 'Renda mitjana bruta',
};

function getValue(r: Restaurant, axis: AnalisiAxis): number {
  switch (axis) {
    case 'price': return r.price;
    case 'score': return r.score;
    case 'opinions': return r.opinions_count;
    case 'dist': return r.dist_centre_km;
    case 'renda': return r.renda_mitjana_bruta;
  }
}

const MARGIN = { top: 40, right: 30, bottom: 60, left: 80 };

export default function ScatterPlot({ data, xAxis, yAxis }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const container = svgRef.current.parentElement!;
    const width = container.clientWidth - MARGIN.left - MARGIN.right;
    const height = Math.max(container.clientHeight - MARGIN.top - MARGIN.bottom, 200);

    d3.select(svgRef.current).selectAll('*').remove();

    // Filter valid points
    const valid = data.filter((r) => getValue(r, xAxis) > 0 && getValue(r, yAxis) > 0);

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + MARGIN.left + MARGIN.right)
      .attr('height', height + MARGIN.top + MARGIN.bottom)
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    if (valid.length === 0) {
      svg.append('text').attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle').attr('fill', '#999').text('Sense dades vàlides');
      return;
    }

    const x = d3.scaleLinear()
      .domain(d3.extent(valid, (r) => getValue(r, xAxis)) as [number, number]).nice().range([0, width]);
    const y = d3.scaleLinear()
      .domain(d3.extent(valid, (r) => getValue(r, yAxis)) as [number, number]).nice().range([height, 0]);
    const color = d3.scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(valid, (r) => r.score) as [number, number]);

    // Grid
    svg.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3'));

    svg.append('g').attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3'));

    // Axes
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(7));
    svg.append('g').call(d3.axisLeft(y).ticks(6));

    // Axis labels
    svg.append('text').attr('x', width / 2).attr('y', height + 48)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text(AXIS_LABELS[xAxis]);

    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -65)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text(AXIS_LABELS[yAxis]);

    svg.append('text').attr('x', width / 2).attr('y', -18)
      .attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold').attr('fill', '#222')
      .text(`${AXIS_LABELS[xAxis]} vs ${AXIS_LABELS[yAxis]}`);

    // Tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip')
      .style('position', 'absolute').style('background', 'rgba(255,255,255,0.95)')
      .style('border', '1px solid #ccc').style('border-radius', '6px')
      .style('padding', '7px 11px').style('font-size', '12px')
      .style('pointer-events', 'none').style('opacity', 0);

    // Trend line (linear regression)
    const n = valid.length;
    const xVals = valid.map((r) => getValue(r, xAxis));
    const yVals = valid.map((r) => getValue(r, yAxis));
    const xMean = d3.mean(xVals)!;
    const yMean = d3.mean(yVals)!;
    const slope = d3.sum(xVals, (xi, i) => (xi - xMean) * (yVals[i] - yMean)) /
      d3.sum(xVals, (xi) => (xi - xMean) ** 2);
    const intercept = yMean - slope * xMean;
    const xExtent = d3.extent(xVals) as [number, number];

    if (n > 2) {
      svg.append('line')
        .attr('x1', x(xExtent[0])).attr('y1', y(slope * xExtent[0] + intercept))
        .attr('x2', x(xExtent[1])).attr('y2', y(slope * xExtent[1] + intercept))
        .attr('stroke', '#ef4444').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,3').attr('opacity', 0.7);
    }

    // Dots
    svg.selectAll<SVGCircleElement, Restaurant>('circle')
      .data(valid, (d) => d.id)
      .join('circle')
      .attr('cx', (r) => x(getValue(r, xAxis)))
      .attr('cy', (r) => y(getValue(r, yAxis)))
      .attr('r', 4)
      .attr('fill', (r) => color(r.score))
      .attr('stroke', 'rgba(255,255,255,0.5)').attr('stroke-width', 0.5)
      .attr('opacity', 0.7)
      .on('mouseover', (event, r) => {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(
          `<strong>${r.name}</strong><br/>` +
          `${AXIS_LABELS[xAxis]}: ${getValue(r, xAxis).toFixed(2)}<br/>` +
          `${AXIS_LABELS[yAxis]}: ${getValue(r, yAxis).toFixed(2)}<br/>` +
          `Zona: ${r.zone}`
        );
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${(event as MouseEvent).pageX + 14}px`)
          .style('top', `${(event as MouseEvent).pageY - 28}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

    // Color legend (score)
    const legendW = 120, legendH = 10;
    const legendX = width - legendW;
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'scatter-legend-grad');
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      grad.append('stop').attr('offset', `${t * 100}%`)
        .attr('stop-color', d3.interpolateViridis(t));
    });
    svg.append('rect').attr('x', legendX).attr('y', -32)
      .attr('width', legendW).attr('height', legendH)
      .attr('fill', 'url(#scatter-legend-grad)').attr('rx', 2);
    const scoreExtent = d3.extent(valid, (r) => r.score) as [number, number];
    svg.append('text').attr('x', legendX).attr('y', -36).attr('font-size', '9px').attr('fill', '#555')
      .text(`Puntuació ${scoreExtent[0].toFixed(1)}`);
    svg.append('text').attr('x', legendX + legendW).attr('y', -36)
      .attr('text-anchor', 'end').attr('font-size', '9px').attr('fill', '#555')
      .text(scoreExtent[1].toFixed(1));

    return () => { tooltip.remove(); };
  }, [data, xAxis, yAxis]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}

