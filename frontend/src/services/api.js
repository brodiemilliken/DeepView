import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const startTraining = async (layers) => {
  const res = await axios.post(`${backendUrl}/train`, { layers });
  return res.data;
};

export const stopTraining = async () => {
  const res = await axios.post(`${backendUrl}/stop`);
  return res.data;
};

export const pauseTraining = async () => {
  const res = await axios.post(`${backendUrl}/pause`);
  return res.data;
};

export const resumeTraining = async () => {
  const res = await axios.post(`${backendUrl}/resume`);
  return res.data;
};