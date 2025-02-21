import React, { Component } from 'react';
import { startTraining as apiStartTraining, stopTraining as apiStopTraining } from '../api/apiClient';
import { TrainingContext } from '../contexts/TrainingContext';

class HyperparameterForm extends Component {
  static contextType = TrainingContext;

  constructor(props) {
    super(props);
    this.state = {
      learningRate: '',
      batchSize: ''
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleTrainingAction = () => {
    const { isTraining, setIsTraining, startTraining } = this.context;

    if (!isTraining) {
      // Start training process
      const { learningRate, batchSize } = this.state;
      const hyperparams = {
        learning_rate: learningRate,
        batch_size: batchSize
      };

      apiStartTraining(hyperparams)
        .then(response => {
          console.log(response.data);
          // Signal that training has started.
          startTraining();
        })
        .catch(error => console.error(error));
    } else {
      // Stop training process
      apiStopTraining()
        .then(response => {
          console.log(response.data);
          // Mark training as stopped, which resets the UI.
          setIsTraining(false);
        })
        .catch(error => console.error(error));
    }
  };

  render() {
    const { isTraining } = this.context;

    return (
      <div>
        <h2>Training Hyperparameters</h2>
        <div>
          <label>Learning Rate:</label>
          <input
            type="text"
            name="learningRate"
            value={this.state.learningRate}
            onChange={this.handleChange}
            disabled={isTraining}
          />
        </div>
        <div>
          <label>Batch Size:</label>
          <input
            type="text"
            name="batchSize"
            value={this.state.batchSize}
            onChange={this.handleChange}
            disabled={isTraining}
          />
        </div>
        <button onClick={this.handleTrainingAction}>
          {isTraining ? 'Stop Training' : 'Start Training'}
        </button>
      </div>
    );
  }
}

export default HyperparameterForm;