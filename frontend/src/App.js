import React from 'react';
import HyperparameterForm from './components/HyperparameterForm';
import TrainingController from './components/TrainingController';
import NeuronVisualization from './components/NeuronVisualization';
import NetworkVisualization from './components/NetworkVisualization';
import { TrainingProvider } from './contexts/TrainingContext';
import { NetworkProvider } from './contexts/NetworkContext';

function App() {
  return (
    <TrainingProvider>
      <div className="App">
        <HyperparameterForm />
        <hr />
        <TrainingController />
        <hr />
        <NetworkProvider>
          <NeuronVisualization />
          <hr />
          <NetworkVisualization />
        </NetworkProvider>
      </div>
    </TrainingProvider>
  );
}

export default App;