import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Restaurant, primaryFood, primaryAmbient } from '../../lib/restaurantData';
import { ExploracioXAxis, ExploracioYAxis } from '../../context/AppContext';

interface Props {
  data: Restaurant[];
  xAxis: ExploracioXAxis;
  yAxis: ExploracioYAxis;
}

const X_LABELS: Record<ExploracioXAxis, string> = {
  zone: 'Zona',
  food: 'Tipus de menjar',
  ambient: 'Ambient',
};

const Y_LABELS: Record<ExploracioYAxis, string> = {
  price: 'Preu mitjà (€)',
  score: 'Puntuació mitjana',
  opinions: 'Opinions (mitjana)',
};

function getXValue(r: Restaurant, xAxis: ExploracioXAxis): string {
  if (xAxis === 'zone') return r.zone;
  if (xAxis === 'food') return primaryFood(r);
  return primaryAmbient(r);
}

function getYValue(r: Restaurant, yAxis: ExploracioYAxis): number {
  if (yAxis === 'price') return r.price;
  if (yAxis === 'score') return r.score;
  return r.opinions_count;
}

const MAX_BARS = 20;
const MARGIN = { top: 40, right: 20, bottom: 120, left: 70 };

export default function BarChart({ data, xAxis, yAxis }: Props) {
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

    // Aggregate by X category
    const grouped = d3.rollup(
      data.filter((r) => getYValue(r, yAxis) > 0 && getXValue(r, xAxis).trim() !== ''),
      (v) => d3.mean(v, (r) => getYValue(r, yAxis)) ?? 0,
      (r) => getXValue(r, xAxis)
    );

    const chartData = [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_BARS);

    if (chartData.length === 0) {
      svg.append('text').attr('x', width / 2).attr('y', height / 2)
        .attr('text-anchor', 'middle').attr('fill', '#999').text('Sense dades');
      return;
    }

    const x = d3.scaleBand().domain(chartData.map((d) => d[0])).range([0, width]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(chartData, (d) => d[1])!]).nice().range([height, 0]);
    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, chartData.length]);

    // Grid lines
    svg.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('line').attr('stroke', '#e5e7eb').attr('stroke-dasharray', '3,3'));

    // Axes
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em')
      .attr('font-size', '11px');

    svg.append('g').call(d3.axisLeft(y).ticks(6));

    // Axis labels
    svg.append('text').attr('x', width / 2).attr('y', height + MARGIN.bottom - 10)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text(X_LABELS[xAxis]);

    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -55)
      .attr('text-anchor', 'middle').attr('font-size', '12px').attr('fill', '#555')
      .text(Y_LABELS[yAxis]);

    // Chart title
    svg.append('text').attr('x', width / 2).attr('y', -20)
      .attr('text-anchor', 'middle').attr('font-size', '14px').attr('font-weight', 'bold').attr('fill', '#222')
      .text(`${Y_LABELS[yAxis]} per ${X_LABELS[xAxis]}`);

    // Tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'chart-tooltip')
      .style('position', 'absolute').style('background', 'rgba(255,255,255,0.95)')
      .style('border', '1px solid #ccc').style('border-radius', '6px')
      .style('padding', '7px 11px').style('font-size', '12px')
      .style('pointer-events', 'none').style('opacity', 0);

    // Bars
    svg.selectAll('rect').data(chartData).join('rect')
      .attr('x', (d) => x(d[0])!)
      .attr('y', (d) => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d[1]))
      .attr('fill', (_, i) => color(chartData.length - i))
      .attr('rx', 3)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(100).style('opacity', 1);
        tooltip.html(`<strong>${d[0]}</strong><br/>${Y_LABELS[yAxis]}: ${d[1].toFixed(2)}`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${(event as MouseEvent).pageX + 14}px`)
          .style('top', `${(event as MouseEvent).pageY - 28}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

    return () => { tooltip.remove(); };
  }, [data, xAxis, yAxis]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}

