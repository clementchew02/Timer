// frontend/composables/useSocket.js
import { io } from 'socket.io-client';

// Connect to the backend server (port 3001)
const socket = io('http://localhost:3001'); 

export function useSocket() {
  return {
    socket
  };
}