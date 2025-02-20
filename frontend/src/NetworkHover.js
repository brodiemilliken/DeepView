import * as d3 from 'd3';
import { getColorForWeight } from './NetworkVisualizer';
import { getColorGrid } from './GridCalculator';

export const enableNeuronHover = (weights, layerGrids) => {
  const svg = d3.select('#network');

  svg.selectAll('circle')
    .on('mouseover', function (event) {
      const circle = d3.select(this);
      const layer = parseInt(circle.attr('data-layer'), 10);
      const neuron = parseInt(circle.attr('data-neuron'), 10);
      displayNeuronInfo(layer, neuron);
      drawGrid(layer, neuron, layerGrids);
    })
    .on('mouseout', function () {
      hideNeuronInfo();
      hideInputGrid();
    });
};

const displayNeuronInfo = (layer, neuron) => {
  const fixedInfoBox = d3.select('#fixed-neuron-info');
  fixedInfoBox.text(`Layer: ${layer}, Neuron: ${neuron}`);
  fixedInfoBox.style('display', 'block');
};

const hideNeuronInfo = () => {
  const infoBox = d3.select('#neuron-info');
  infoBox.style('display', 'none');

  const fixedInfoBox = d3.select('#fixed-neuron-info');
  fixedInfoBox.style('display', 'none');
};

const drawGrid = (layer, neuron, layerGrids) => {
  const gridSize = 28;
  const gridSpacing = 5;
  const gridOffsetX = 10;
  const gridOffsetY = 50;

  const grid = layerGrids[layer][neuron];
  const colorGrid = getColorGrid(grid);

  const svg = d3.select('#fixed-neuron-info')
    .append('svg')
    .attr('id', 'input-grid')
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
};

const hideInputGrid = () => {
  d3.select('#input-grid').remove();
};