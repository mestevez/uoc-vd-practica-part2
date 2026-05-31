import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Restaurant } from '../../lib/restaurantData';

interface Props {
  data: Restaurant[];
}

/**
 * Bar chart: Top 10 cuisine types by average score.
 */
export default function TopCuisineChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 40, right: 30, bottom: 100, left: 60 };
    const width = 760 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Aggregate: average score per primary cuisine type
    const byCuisine = d3.rollup(
      data.filter((d) => d.score > 0 && d.food.trim() !== ''),
      (v) => d3.mean(v, (d) => d.score) ?? 0,
      (d) => d.food.split(',')[0].trim()
    );

    const sorted = Array.from(byCuisine.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    const x = d3
      .scaleBand()
      .domain(sorted.map((d) => d[0]))
      .range([0, width])
      .padding(0.25);

    const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([7, 10]);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll('text')
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em')
      .attr('font-size', '11px');

    svg.append('g').call(d3.axisLeft(y).ticks(5));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .text('Top tipus de cuina per puntuació mitjana');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -48)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('fill', '#555')
      .text('Puntuació mitjana');

    svg
      .selectAll('rect')
      .data(sorted)
      .join('rect')
      .attr('x', (d) => x(d[0]) ?? 0)
      .attr('y', (d) => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d[1]))
      .attr('fill', (d) => colorScale(d[1]))
      .attr('rx', 3);

    svg
      .selectAll('.bar-label')
      .data(sorted)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => (x(d[0]) ?? 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d[1]) - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text((d) => d[1].toFixed(2));
  }, [data]);

  return <svg ref={svgRef} style={{ width: '100%', height: 'auto', display: 'block' }} />;
}

