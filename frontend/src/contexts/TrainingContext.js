import React, { createContext, useState } from 'react';

export const TrainingContext = createContext();

export function TrainingProvider({ children }) {
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTraining = () => {
    // When training starts, reset pause state as well.
    setIsTraining(true);
    setIsPaused(false);
  };

  const togglePause = async (pauseAPI, resumeAPI) => {
    if (isPaused) {
      await resumeAPI();
      setIsPaused(false);
    } else {
      await pauseAPI();
      setIsPaused(true);
    }
  };

  return (
    <TrainingContext.Provider
      value={{ isTraining, setIsTraining, isPaused, setIsPaused, startTraining, togglePause }}
    >
      {children}
    </TrainingContext.Provider>
  );
}