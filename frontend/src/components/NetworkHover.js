import * as d3 from 'd3';
import { drawGrid } from './GridVisualizer';

/**
 * Enable hover/click functionality for neurons in the network visualization.
 * When a neuron (circle) is clicked, its corresponding grid is drawn in 
 * the fixed container at the top right.
 *
 * @param {Array} weights - The weights of the neural network.
 * @param {Array} layerGrids - The pre-computed grids for each layer.
 */
export const enableNeuronHover = (weights, layerGrids) => {
  // Select all neurons (circles) in the network SVG
  d3.selectAll('#network circle')
    .on('click', function () {
      const circle = d3.select(this);
      const layer = circle.attr('data-layer');
      const neuron = circle.attr('data-neuron');
      console.log(`Neuron clicked - Layer: ${layer}, Neuron: ${neuron}`);

      // Retrieve the corresponding grid.
      // Assuming layerGrids is an array (one per layer) of arrays (one per neuron)
      if (layerGrids && layerGrids[layer] && layerGrids[layer][neuron]) {
        const grid = layerGrids[layer][neuron];

        // Clear any existing grid in the fixed container
        d3.select('#fixed-neuron-info').selectAll('*').remove();

        // Draw the grid using the drawGrid function
        const gridSvg = drawGrid(grid);
        // Append the SVG element (returned from drawGrid) to the container
        d3.select('#fixed-neuron-info').node().appendChild(gridSvg);
      } else {
        console.warn(`No grid available for layer ${layer}, neuron ${neuron}`);
      }
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
  // Clear any existing grid from the fixed container
  d3.select('#fixed-neuron-info').selectAll('*').remove();
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