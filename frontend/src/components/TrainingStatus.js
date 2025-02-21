import React from 'react';

const TrainingStatus = ({ response, error, avgError, isTraining, epoch, batch }) => {
  return (
    <div>
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
    </div>
  );
};

export default TrainingStatus;