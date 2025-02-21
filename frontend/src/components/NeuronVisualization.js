import React, { Component } from 'react';
import { NetworkContext } from '../contexts/NetworkContext';
import { visualizeNeuron } from '../api/apiClient';

class NeuronVisualization extends Component {
  static contextType = NetworkContext;

  constructor(props) {
    super(props);
    this.state = {
      vizNeuronId: ''
    };
  }

  handleChange = (e) => {
    this.setState({ vizNeuronId: e.target.value });
  };

  submitVisualization = () => {
    const vizParams = { neuron_id: this.state.vizNeuronId };
    visualizeNeuron(vizParams)
      .then(response => console.log(response.data))
      .catch(error => console.error(error));
  };

  render() {
    return (
      <div>
        <h3>Neuron Visualization</h3>
        <label>Neuron ID:</label>
        <input
          type="text"
          name="vizNeuronId"
          value={this.state.vizNeuronId}
          onChange={this.handleChange}
        />
        <button onClick={this.submitVisualization}>Visualize</button>
      </div>
    );
  }
}

export default NeuronVisualization;