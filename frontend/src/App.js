// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function App() {
  const [config, setConfig] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    // Connect to the backend Socket.IO server
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backendUrl);

    // Listen for live training updates
    socket.on('training_update', (data) => {
      if (data.error !== undefined) {
        setError(data.error);
      }
      if (data.message) {
        setResponse(data.message);
      }
    });

    // Clean up the connection when the component unmounts
    return () => socket.disconnect();
  }, []);

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

  // Single button that toggles based on training status
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
            Layer configuration (comma-separated, e.g., "128,64,10"):
            <input
              type="text"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              style={{ marginLeft: '10px' }}
              disabled={isTraining} // Disable input during training
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
    </div>
  );
}

export default App;
