import * as d3 from 'd3';

export const enableNeuronHover = () => {
  const svg = d3.select('#network');

  svg.selectAll('circle')
    .on('mouseover', function (event) {
      const circle = d3.select(this);
      const layer = parseInt(circle.attr('data-layer'), 10);
      const neuron = parseInt(circle.attr('data-neuron'), 10);
      displayNeuronInfo(layer, neuron);
    })
    .on('mouseout', function () {
      hideNeuronInfo();
    });
};

const displayNeuronInfo = (layer, neuron) => {
  const fixedInfoBox = d3.select('#fixed-neuron-info');
  fixedInfoBox.text(`Layer: ${layer + 1}, Neuron: ${neuron + 1}`);
  fixedInfoBox.style('display', 'block');
};

const hideNeuronInfo = () => {
  const infoBox = d3.select('#neuron-info');
  infoBox.style('display', 'none');

  const fixedInfoBox = d3.select('#fixed-neuron-info');
  fixedInfoBox.style('display', 'none');
};