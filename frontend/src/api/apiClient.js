// filepath: frontend/src/api/apiClient.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const startTraining = (hyperparams) =>
  axios.post(`${API_BASE_URL}/train`, hyperparams);

export const pauseTraining = () =>
  axios.post(`${API_BASE_URL}/pause`);

export const resumeTraining = () =>
  axios.post(`${API_BASE_URL}/resume`);

export const stopTraining = () =>
  axios.post(`${API_BASE_URL}/stop`);

export const visualizeNeuron = (vizParams) =>
  axios.post(`${API_BASE_URL}/visualize`, vizParams);