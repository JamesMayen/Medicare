import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (() => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        console.error("❌ No VITE_API_URL found in environment variables");
        return null;
      }
      // Derive socket URL by replacing '/api' with empty string and adjusting protocol
      let socketUrl = apiUrl.replace('/api', '');
      socketUrl = socketUrl.replace(/^http/, 'ws');
      return socketUrl;
    })();

    if (!SOCKET_URL) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: user?.token ? { token: user.token } : undefined,
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
