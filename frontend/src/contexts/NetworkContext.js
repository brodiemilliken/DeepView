import React, { createContext, useContext, useState } from 'react';
import { TrainingContext } from './TrainingContext';

export const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const { isTraining } = useContext(TrainingContext);
  
  if (!isTraining) {
    return null; 
  }
  
  const [networkData, setNetworkData] = useState(null);

  return (
    <NetworkContext.Provider value={{ networkData, setNetworkData }}>
      {children}
    </NetworkContext.Provider>
  );
}