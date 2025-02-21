import React, { useContext } from 'react';
import { NetworkContext } from '../contexts/NetworkContext';

function NetworkVisualization() {
  const { networkData } = useContext(NetworkContext);

  return (
    <div>
      <h3>Network Visualization</h3>
      <p>{networkData ? "Network data loaded." : "No network visualization available."}</p>
    </div>
  );
}

export default NetworkVisualization;