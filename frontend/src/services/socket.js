import io from 'socket.io-client';

let socket;

export const initializeSocket = (backendUrl) => {
  socket = io(backendUrl);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const subscribeToTrainingUpdates = (callback) => {
  if (socket) {
    socket.on('training_update', callback);
  }
};