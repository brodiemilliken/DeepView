import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { enableNeuronHover } from './NetworkHover';
import { getColorForWeight } from '../utils/colorUtils';

/**
 * Component for visualizing the neural network.
 * @param {Array} weights - The weights of the neural network.
 * @param {boolean} drawWeights - Flag to indicate whether to draw weights.
 * @param {Function} setLayerGrids - Function to set the layer grids.
 */
const NetworkVisualization = ({ weights, drawWeights, setLayerGrids }) => {
  useEffect(() => {
    if (weights.length > 0) {
      console.log('Drawing network with fetched weights...'); // Log before drawing the network
      drawNetwork(weights, drawWeights); // Draw the network
    }
  }, [weights, drawWeights]); // Add drawWeights to the dependency array

  return <svg id="network"></svg>;
};

export default NetworkVisualization;

/**
 * Draw the neural network visualization.
 * @param {Array} weights - The weights of the neural network.
 * @param {boolean} drawWeights - Flag to indicate whether to draw weights.
 */
export const drawNetwork = (weights, drawWeights) => {
  console.log('Drawing network with weights:', weights); // Log the weights data

  const layerSpacing = 150;
  const neuronSpacing = 30;
  const gridSpacing = 5; // Smaller grid
  const gridSize = 28;
  const gridOffsetX = 50;

  // Calculate the maximum number of neurons in any layer
  const maxNeurons = Math.max(...weights.map(layer => layer.length));
  const svgHeight = maxNeurons * neuronSpacing + 50; // Add some padding

  const svg = d3.select('#network')
    .attr('width', 1000)
    .attr('height', svgHeight);

  // Clear previous drawings
  svg.selectAll('*').remove();

  // Calculate the vertical center for the grid
  const gridHeight = gridSize * gridSpacing;
  const gridOffsetY = (svgHeight - gridHeight) / 2;

  // Draw the input layer as a 28x28 grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = j * gridSpacing + gridOffsetX;
      const y = i * gridSpacing + gridOffsetY;

      svg.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', gridSpacing)
        .attr('height', gridSpacing)
        .attr('fill', 'lightgray')
        .attr('stroke', 'black');
    }
  }

  // Draw the lines first if drawWeights is true
  if (drawWeights) {
    weights.forEach((layer, layerIndex) => {
      const layerHeight = layer.length * neuronSpacing;
      const layerOffsetY = (svgHeight - layerHeight) / 2;

      layer.forEach((neuronWeights, neuronIndex) => {
        const x = (layerIndex + 1) * layerSpacing + gridOffsetX + gridSize * gridSpacing;
        const y = neuronIndex * neuronSpacing + layerOffsetY;

        if (layerIndex === 0) {
          // Connect input layer to the first hidden layer
          neuronWeights.forEach((weight, inputIndex) => {
            const inputX = (inputIndex % gridSize) * gridSpacing + gridOffsetX + gridSpacing / 2;
            const inputY = Math.floor(inputIndex / gridSize) * gridSpacing + gridOffsetY + gridSpacing / 2;
            const color = getColorForWeight(weight);

            svg.append('line')
              .attr('x1', inputX)
              .attr('y1', inputY)
              .attr('x2', x)
              .attr('y2', y)
              .attr('stroke', color)
              .attr('stroke-width', Math.abs(weight) * 2); // Thinner lines
          });
        } else {
          // Connect hidden layers and the output layer
          neuronWeights.forEach((weight, prevNeuronIndex) => {
            const prevLayerHeight = weights[layerIndex - 1].length * neuronSpacing;
            const prevLayerOffsetY = (svgHeight - prevLayerHeight) / 2;
            const prevX = layerIndex * layerSpacing + gridOffsetX + gridSize * gridSpacing;
            const prevY = prevNeuronIndex * neuronSpacing + prevLayerOffsetY;
            const color = getColorForWeight(weight);

            svg.append('line')
              .attr('x1', prevX)
              .attr('y1', prevY)
              .attr('x2', x)
              .attr('y2', y)
              .attr('stroke', color)
              .attr('stroke-width', Math.abs(weight) * 2); // Thinner lines
          });
        }
      });
    });
  }

  // Draw the circles (neurons) on top of the lines
  weights.forEach((layer, layerIndex) => {
    const layerHeight = layer.length * neuronSpacing;
    const layerOffsetY = (svgHeight - layerHeight) / 2;

    layer.forEach((neuronWeights, neuronIndex) => {
      const x = (layerIndex + 1) * layerSpacing + gridOffsetX + gridSize * gridSpacing;
      const y = neuronIndex * neuronSpacing + layerOffsetY;

      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8) // Smaller neurons
        .attr('fill', 'black')
        .attr('data-layer', layerIndex)
        .attr('data-neuron', neuronIndex);
    });
  });
};