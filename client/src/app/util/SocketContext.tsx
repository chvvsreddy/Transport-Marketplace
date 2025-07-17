// SocketProvider.tsx

"use client";

import React, { createContext, useEffect, useState, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { getLoggedUserFromLS } from "./getLoggedUserFromLS";
import { getSocket } from "./socket";

interface ISocketContext {
  socket: Socket;
  isConnected: boolean;
}

export const SocketContext = createContext<ISocketContext | undefined>(
  undefined
);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("✅ Connected:", socket.id);
      setIsConnected(true);

      const user = getLoggedUserFromLS();
      const userId = user?.userId;
      if (userId) {
        socket.emit("register", userId);
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log("❌ Disconnected:", reason);
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
