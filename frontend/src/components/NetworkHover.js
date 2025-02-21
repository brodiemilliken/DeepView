import * as d3 from 'd3';
import { drawGrid } from './GridVisualizer';

/**
 * Enable hover functionality for neurons in the network visualization.
 * @param {Array} weights - The weights of the neural network.
 * @param {Array} layerGrids - The grids for each layer.
 */
export const enableNeuronHover = (weights, layerGrids) => {
  const svg = d3.select('#network');

  svg.selectAll('circle')
    .on('mouseover', function (event) {
      const circle = d3.select(this);
      const layer = parseInt(circle.attr('data-layer'), 10);
      const neuron = parseInt(circle.attr('data-neuron'), 10);
      displayNeuronInfo(layer, neuron);
      drawNeuronGrid(layer, neuron, layerGrids);
    })
    .on('mouseout', function () {
      hideNeuronInfo();
      hideNeuronGrid();
    });
};

/**
 * Display information about the hovered neuron.
 * @param {number} layer - The layer index of the neuron.
 * @param {number} neuron - The neuron index within the layer.
 */
const displayNeuronInfo = (layer, neuron) => {
  const fixedInfoBox = d3.select('#fixed-neuron-info');
  fixedInfoBox.text(`Layer: ${layer}, Neuron: ${neuron}`);
  fixedInfoBox.style('display', 'block');
};

/**
 * Draw the grid for the hovered neuron.
 * @param {number} layer - The layer index of the neuron.
 * @param {number} neuron - The neuron index within the layer.
 * @param {Array} layerGrids - The grids for each layer.
 */
const drawNeuronGrid = (layer, neuron, layerGrids) => {
  const grid = layerGrids[layer][neuron];
  const gridSvg = drawGrid(grid);

  d3.select('#fixed-neuron-info').node().appendChild(gridSvg);
};

/**
 * Hide the neuron information display.
 */
const hideNeuronInfo = () => {
  const infoBox = d3.select('#neuron-info');
  infoBox.style('display', 'none');

  const fixedInfoBox = d3.select('#fixed-neuron-info');
  fixedInfoBox.style('display', 'none');
};

/**
 * Hide the neuron grid display.
 */
const hideNeuronGrid = () => {
  d3.select('#fixed-neuron-info svg').remove();
};