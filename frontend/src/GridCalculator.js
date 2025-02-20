import { getColorForWeight } from './NetworkVisualizer';

export const calculateInitialGrids = (weights) => {
  const gridSize = 28;
  const initialGrids = [];

  // Calculate the grid for each neuron in the first layer
  weights[0].forEach((neuronWeights, neuronIndex) => {
    const grid = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const weight = neuronWeights[i * gridSize + j];
        grid.push(weight);
      }
    }

    // Normalize the grid
    const maxGridValue = Math.max(...grid.map(Math.abs));
    if (maxGridValue > 0) {
      for (let i = 0; i < grid.length; i++) {
        grid[i] /= maxGridValue;
      }
    }

    initialGrids.push(grid);
  });

  return initialGrids;
};

export const calculateLayerGrids = (weights, initialGrids) => {
  const gridSize = 28;
  const layerGrids = [initialGrids];

  // Calculate the grids for each layer
  for (let layerIndex = 1; layerIndex < weights.length; layerIndex++) {
    const prevLayerGrids = layerGrids[layerIndex - 1];
    const currentLayerGrids = [];
    const numNeuronsInLayer = weights[layerIndex].length;

    weights[layerIndex].forEach((neuronWeights, neuronIndex) => {
      const grid = new Array(gridSize * gridSize).fill(0);

      neuronWeights.forEach((weight, prevNeuronIndex) => {
        const prevLayerGrid = prevLayerGrids[prevNeuronIndex];
        for (let i = 0; i < gridSize * gridSize; i++) {
          grid[i] += prevLayerGrid[i] * weight;
        }
      });

      // Normalize the grid
      const maxGridValue = Math.max(...grid.map(Math.abs));
      if (maxGridValue > 0) {
        for (let i = 0; i < grid.length; i++) {
          grid[i] /= maxGridValue;
        }
      }

      currentLayerGrids.push(grid);
    });

    layerGrids.push(currentLayerGrids);
  }

  return layerGrids;
};

export const getColorGrid = (grid) => {
  return grid.map(weight => getColorForWeight(weight));
};