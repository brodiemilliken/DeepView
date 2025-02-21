import React from 'react';
import { startTraining, stopTraining, pauseTraining, resumeTraining } from '../services/api';

const TrainingControls = ({ config, setConfig, isTraining, isPaused, setResponse, setIsTraining, setIsPaused, setWeights, setLayerGrids, setEpoch, setBatch, setError, setAvgError }) => {
  const handleStartTraining = async (e) => {
    e.preventDefault();
    const layers = config.split(',').map(layer => parseInt(layer.trim(), 10));
    try {
      const res = await startTraining(layers);
      setResponse(res.message);
      setIsTraining(true);
      setIsPaused(false);
      setWeights([]);
      setLayerGrids([]);
      setEpoch(0);
      setBatch(0);
      setError(null);
      setAvgError(null);
    } catch (err) {
      console.error(err);
      setResponse('Error communicating with backend.');
    }
  };

  const handleStopTraining = async () => {
    try {
      const res = await stopTraining();
      setResponse(res.message);
      setIsTraining(false);
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      setResponse('Error sending stop signal.');
    }
  };

  const handlePauseTraining = async () => {
    try {
      const res = await pauseTraining();
      setResponse(res.message);
      setIsPaused(true);
    } catch (err) {
      console.error(err);
      setResponse('Error sending pause signal.');
    }
  };

  const handleResumeTraining = async () => {
    try {
      const res = await resumeTraining();
      setResponse(res.message);
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      setResponse('Error sending resume signal.');
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (isTraining) {
      handleStopTraining();
    } else {
      handleStartTraining(e);
    }
  };

  return (
    <form onSubmit={handleButtonClick}>
      <div>
        <label>
          Hidden layer configuration (comma-separated, e.g., "16,16"):
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
        {isTraining && !isPaused && (
          <button type="button" onClick={handlePauseTraining} style={{ marginLeft: '10px' }}>
            Pause Training
          </button>
        )}
        {isPaused && (
          <button type="button" onClick={handleResumeTraining} style={{ marginLeft: '10px' }}>
            Resume Training
          </button>
        )}
      </div>
    </form>
  );
};

export default TrainingControls;