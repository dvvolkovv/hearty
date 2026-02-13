import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  error: null
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * SocketProvider - Manages WebSocket connection with Socket.IO
 *
 * Features:
 * - JWT authentication
 * - Auto reconnection
 * - Connection state management
 * - Error handling
 */
export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('🔌 No JWT token found, skipping Socket.IO connection');
      return;
    }

    console.log('🔌 Initializing Socket.IO connection...');

    // Initialize Socket.IO client
    const socketInstance = io(API_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id);
      setConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('🔴 Socket.IO connection error:', err.message);
      setError(err.message);
      setConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setError(null);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnection attempt ${attemptNumber}...`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('🔴 Socket.IO reconnection failed');
      setError('Failed to reconnect to server');
    });

    // Global error handler
    socketInstance.on('error', (errorData: { message: string }) => {
      console.error('🔴 Socket.IO error:', errorData.message);
      setError(errorData.message);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting Socket.IO...');
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array - only initialize once

  return (
    <SocketContext.Provider value={{ socket, connected, error }}>
      {children}
    </SocketContext.Provider>
  );
};
