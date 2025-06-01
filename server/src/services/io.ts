import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: Server;

export function initializeIO(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    pingTimeout: 5000,
    pingInterval: 10000,
    connectTimeout: 5000,
    allowEIO3: true
  });
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}

export default getIO; 