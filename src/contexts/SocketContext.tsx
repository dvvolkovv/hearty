import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket.IO needs base URL without /api path
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Listen for login/logout to reconnect WebSocket
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);
    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      console.warn('🔌 No JWT token found, skipping Socket.IO connection');
      return;
    }

    console.log('🔌 Initializing Socket.IO connection...');

    // Initialize Socket.IO client
    const socketInstance = io(SOCKET_URL, {
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
  }, [token]); // Reconnect when token changes (login/logout)

  return (
    <SocketContext.Provider value={{ socket, connected, error }}>
      {children}
    </SocketContext.Provider>
  );
};
