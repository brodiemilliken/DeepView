import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [config, setConfig] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert the comma-separated input to an array of numbers
    const layers = config.split(',').map((layer) => parseInt(layer.trim(), 10));
    try {
      // Get the backend URL from the environment variable (or default to localhost)
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${backendUrl}/train`, { layers });
      setResponse(res.data.message);
    } catch (error) {
      console.error(error);
      setResponse('Error communicating with backend.');
    }
  };

  return (
    <div style={{ margin: '50px' }}>
      <h1>Neural Network Trainer</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Layer configuration (comma-separated, e.g., "128,64,10"):
            <input
              type="text"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button type="submit">Train</button>
        </div>
      </form>
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
