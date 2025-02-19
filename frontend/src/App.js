import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { drawNetwork } from './NetworkVisualizer';
import { enableNeuronHover } from './NetworkHover';

function App() {
  const [config, setConfig] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [epoch, setEpoch] = useState(0);
  const [batch, setBatch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [weights, setWeights] = useState([]);

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
      if (data.message) {
        setResponse(data.message);
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (weights.length > 0) {
      console.log('Drawing network with fetched weights...'); // Log before drawing the network
      drawNetwork(weights);
      enableNeuronHover(); // Enable neuron hover functionality
    }
  }, [weights]);

  const startTraining = async (e) => {
    e.preventDefault();
    const layers = config.split(',').map(layer => parseInt(layer.trim(), 10));
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/train`, { layers });
      setResponse(res.data.message);
      setIsTraining(true);
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
    } catch (err) {
      console.error(err);
      setResponse('Error sending stop signal.');
    }
  };

  const handleButtonClick = (e) => {
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
          <button type="submit">
            {isTraining ? "Stop Training" : "Train"}
          </button>
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
      {isTraining && (
        <div style={{ marginTop: '20px' }}>
          <h3>Current Batch:</h3>
          <p>{batch}</p>
          <h3>Current Epoch:</h3>
          <p>{epoch}</p>
        </div>
      )}
      <svg id="network"></svg>
      <div id="fixed-neuron-info" style={{ display: 'none', position: 'fixed', top: '10px', right: '10px', backgroundColor: 'white', padding: '10px', border: '1px solid black', fontWeight: 'bold' }}></div>
    </div>
  );
}

export default App;
