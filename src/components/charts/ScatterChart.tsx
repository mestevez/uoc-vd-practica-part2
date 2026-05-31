import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Restaurant } from '../../lib/restaurantData';

interface Props {
  data: Restaurant[];
}

/**
 * Scatter plot: Price (€) vs Score, bubble size = number of opinions.
 * This is the sample chart shown on the home page.
 */
export default function ScatterChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 760 - margin.left - margin.right;
    const height = 460 - margin.top - margin.bottom;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out rows with missing price/score
    const valid = data.filter((d) => d.price > 0 && d.score > 0);

    // Scales
    const x = d3.scaleLinear().domain([0, d3.max(valid, (d) => d.price) ?? 80]).nice().range([0, width]);
    const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);
    const r = d3.scaleSqrt().domain([0, d3.max(valid, (d) => d.opinions_count) ?? 1000]).range([2, 18]);
    const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 10]);

    // Axes
    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(8));
    svg.append('g').call(d3.axisLeft(y).ticks(5));

    // Axis labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('fill', '#555')
      .text('Preu mitjà (€)');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -48)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('fill', '#555')
      .text('Puntuació');

    // Chart title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('fill', '#222')
      .text('Preu vs Puntuació dels restaurants de Barcelona');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(255,255,255,0.95)')
      .style('border', '1px solid #ccc')
      .style('border-radius', '6px')
      .style('padding', '8px 12px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Dots
    svg
      .selectAll('circle')
      .data(valid)
      .join('circle')
      .attr('cx', (d) => x(d.price))
      .attr('cy', (d) => y(d.score))
      .attr('r', (d) => r(d.opinions_count))
      .attr('fill', (d) => color(d.score))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.75)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(150).style('opacity', 1);
        tooltip.html(
          `<strong>${d.name}</strong><br/>` +
            `Zona: ${d.zone}<br/>` +
            `Cuina: ${d.food}<br/>` +
            `Preu: ${d.price} €<br/>` +
            `Puntuació: ${d.score.toFixed(2)}<br/>` +
            `Opinions: ${d.opinions_count}`
        );
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${(event as MouseEvent).pageX + 14}px`)
          .style('top', `${(event as MouseEvent).pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data]);

  return <svg ref={svgRef} style={{ width: '100%', height: 'auto', display: 'block' }} />;
}

