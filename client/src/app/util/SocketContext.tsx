import React, { createContext, useEffect, useState, ReactNode } from "react";
import socket from "./socket";
import { getLoggedUserFromLS } from "./getLoggedUserFromLS";

interface ISocketContext {
  socket: typeof socket;
  isConnected: boolean;
}

export const SocketContext = createContext<ISocketContext | undefined>(
  undefined
);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setIsConnected(true);

      const user = getLoggedUserFromLS();
      const userId = user?.userId;
      if (userId) {
        socket.emit("register", userId);
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
