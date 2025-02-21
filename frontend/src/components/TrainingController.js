import React, { useContext } from 'react';
import { pauseTraining, resumeTraining } from '../api/apiClient';
import { TrainingContext } from '../contexts/TrainingContext';

function TrainingController() {
  const { isTraining, isPaused, togglePause } = useContext(TrainingContext);

  if (!isTraining) {
    return null; // Hide the controller if training is inactive.
  }

  const handleTogglePause = () => {
    togglePause(pauseTraining, resumeTraining)
      .then(() => {
        // The context's isPaused value has been updated via togglePause.
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h2>Training Controller</h2>
      <button onClick={handleTogglePause}>
        {isPaused ? 'Resume Training' : 'Pause Training'}
      </button>
    </div>
  );
}

export default TrainingController;