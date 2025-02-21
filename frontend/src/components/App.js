import React, { useState, useEffect } from 'react';
import { initializeSocket, disconnectSocket, subscribeToTrainingUpdates } from '../services/socket';
import TrainingControls from './TrainingControls';
import TrainingStatus from './TrainingStatus';
import NetworkVisualization from './NetworkVisualization';

function App() {
  const [config, setConfig] = useState('16,16'); // Default hidden layer configuration
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [epoch, setEpoch] = useState(0);
  const [batch, setBatch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [weights, setWeights] = useState([]);
  const [layerGrids, setLayerGrids] = useState([]);
  const [drawWeights, setDrawWeights] = useState(true); // New state for drawing weights
  const [isPaused, setIsPaused] = useState(false); // New state for pausing
  const [avgError, setAvgError] = useState(null); // New state for average error

  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    initializeSocket(backendUrl);

    subscribeToTrainingUpdates((data) => {
      if (data.error !== undefined) {
        setError(data.error);
      }
      if (data.epoch !== undefined) {
        setEpoch(data.epoch);
      }
      if (data.batch !== undefined) {
        setBatch(data.batch);
      }
      if (data.weights !== undefined) {
        // Force a new array reference
        setWeights([...data.weights]);
      }
      if (data.avg_error !== undefined) {
        setAvgError(data.avg_error);
      }
      if (data.initial_grids !== undefined && data.layer_grids !== undefined) {
        setLayerGrids(data.layer_grids);
      }
    });

    return () => disconnectSocket();
  }, []);

  return (
    <div style={{ margin: '50px' }}>
      <h1>Neural Network Trainer</h1>
      <TrainingControls
        config={config}
        setConfig={setConfig}
        isTraining={isTraining}
        isPaused={isPaused}
        setResponse={setResponse}
        setIsTraining={setIsTraining}
        setIsPaused={setIsPaused}
        setWeights={setWeights}
        setLayerGrids={setLayerGrids}
        setEpoch={setEpoch}
        setBatch={setBatch}
        setError={setError}
        setAvgError={setAvgError}
      />
      <TrainingStatus
        response={response}
        error={error}
        avgError={avgError}
        isTraining={isTraining}
        epoch={epoch}
        batch={batch}
      />
      <NetworkVisualization
        weights={weights}
        drawWeights={drawWeights}
        setLayerGrids={setLayerGrids}
      />
      <div id="neuron-info" style={{ display: 'none', marginTop: '20px', fontWeight: 'bold' }}></div>
      {/* Container for the fixed neuron grid */}
      <div id="fixed-neuron-info" style={{
        position: 'fixed',
        top: '10px', 
        right: '10px',
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid black',
        fontWeight: 'bold'
      }}></div>
    </div>
  );
}

export default App;
