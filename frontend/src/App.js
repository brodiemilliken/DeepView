import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { drawNetwork } from './NetworkVisualizer';
import { enableNeuronHover } from './NetworkHover';

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
    const socket = io(backendUrl);

    socket.on('training_update', (data) => {
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
        setWeights(data.weights);
      }
      if (data.avg_error !== undefined) {
        setAvgError(data.avg_error);
      }
      if (data.message) {
        setResponse(data.message);
        if (data.message === 'Training paused.') {
          setIsPaused(true);
        } else if (data.message === 'Training resumed.') {
          setIsPaused(false);
        }
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (weights.length > 0) {
      console.log('Drawing network with fetched weights...'); // Log before drawing the network
      const layerGrids = drawNetwork(weights, drawWeights); // Pass drawWeights to drawNetwork
      setLayerGrids(layerGrids);
      enableNeuronHover(weights, layerGrids); // Pass weights and layerGrids to enableNeuronHover
    }
  }, [weights, drawWeights]); // Add drawWeights to the dependency array

  const startTraining = async (e) => {
    e.preventDefault();
    const layers = config.split(',').map(layer => parseInt(layer.trim(), 10));
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/train`, { layers });
      setResponse(res.data.message);
      setIsTraining(true);
      setIsPaused(false);
      // Clear previous visualization and weights
      setWeights([]);
      setLayerGrids([]);
      setEpoch(0);
      setBatch(0);
      setError(null);
      setAvgError(null); // Clear previous average error
    } catch (err) {
      console.error(err);
      setResponse('Error communicating with backend.');
    }
  };

  const stopTraining = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/stop`);
      setResponse(res.data.message);
      setIsTraining(false);
      setIsPaused(false); // Ensure paused state is reset
    } catch (err) {
      console.error(err);
      setResponse('Error sending stop signal.');
    }
  };

  const pauseTraining = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/pause`);
      setResponse(res.data.message);
      setIsPaused(true);
    } catch (err) {
      console.error(err);
      setResponse('Error sending pause signal.');
    }
  };

  const resumeTraining = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/resume`);
      setResponse(res.data.message);
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      setResponse('Error sending resume signal.');
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault(); 
    if (isTraining) {
      stopTraining();
    } else {
      startTraining(e);
    }
  };

  return (
    <div style={{ margin: '50px' }}>
      <h1>Neural Network Trainer</h1>
      <form onSubmit={handleButtonClick}>
        <div>
          <label>
            Hidden layer configuration (comma-separated, e.g., "128,64"):
            <input
              type="text"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              style={{ marginLeft: '10px' }}
              disabled={isTraining}
            />
          </label>
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>
            Draw Weights:
            <input
              type="checkbox"
              checked={drawWeights}
              onChange={(e) => setDrawWeights(e.target.checked)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button type="submit">
            {isTraining ? "Stop Training" : "Train"}
          </button>
          {isTraining && !isPaused && (
            <button type="button" onClick={pauseTraining} style={{ marginLeft: '10px' }}>
              Pause Training
            </button>
          )}
          {isPaused && (
            <button type="button" onClick={resumeTraining} style={{ marginLeft: '10px' }}>
              Resume Training
            </button>
          )}
        </div>
      </form>
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
      {error !== null && (
        <div style={{ marginTop: '20px' }}>
          <h3>Live Training Error:</h3>
          <p>{error}</p>
        </div>
      )}
      {avgError !== null && (
        <div style={{ marginTop: '20px' }}>
          <h3>Average Training Error:</h3>
          <p>{avgError}</p>
        </div>
      )}
      {isTraining && (
        <div style={{ marginTop: '20px' }}>
          <h3>Current Batch:</h3>
          <p>{batch}</p>
          <h3>Current Epoch:</h3>
          <p>{epoch}</p>
        </div>
      )}
      <svg id="network"></svg>
      <div id="neuron-info" style={{ display: 'none', marginTop: '20px', fontWeight: 'bold' }}></div>
      <div id="fixed-neuron-info" style={{ display: 'none', position: 'fixed', top: '10px', right: '10px', backgroundColor: 'white', padding: '10px', border: '1px solid black', fontWeight: 'bold' }}></div>
    </div>
  );
}

export default App;
