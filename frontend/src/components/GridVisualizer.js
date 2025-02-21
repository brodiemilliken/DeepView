import * as d3 from 'd3';
import { getColorForWeight } from '../utils/colorUtils';

/**
 * Draw the grid visualization for a given neuron.
 * @param {Array} grid - The grid data for the neuron.
 * @param {number} gridSize - The size of the grid (e.g., 28 for a 28x28 grid).
 * @param {number} gridSpacing - The spacing between grid cells.
 * @param {number} gridOffsetX - The X offset for the grid.
 * @param {number} gridOffsetY - The Y offset for the grid.
 * @returns {SVGElement} - The SVG element containing the grid visualization.
 */
export const drawGrid = (grid, gridSize = 28, gridSpacing = 5, gridOffsetX = 10, gridOffsetY = 50) => {
  const colorGrid = grid.map(getColorForWeight);

  const svg = d3.create('svg')
    .attr('width', gridSize * gridSpacing)
    .attr('height', gridSize * gridSpacing)
    .style('position', 'absolute')
    .style('top', `${gridOffsetY}px`)
    .style('left', `${gridOffsetX}px`);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const color = colorGrid[i * gridSize + j];

      svg.append('rect')
        .attr('x', j * gridSpacing)
        .attr('y', i * gridSpacing)
        .attr('width', gridSpacing)
        .attr('height', gridSpacing)
        .attr('fill', color)
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 0.5);
    }
  }

  // Draw the border
  svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', gridSize * gridSpacing)
    .attr('height', gridSize * gridSpacing)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);

  return svg.node();
};