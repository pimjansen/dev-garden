import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only initialize socket on client side
    if (typeof window === "undefined") return;

    const socketInstance = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      
      // Generate or get user identity
      let userId = localStorage.getItem("userId");
      let userName = localStorage.getItem("userName");
      
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem("userId", userId);
      }
      
      if (!userName) {
        userName = `User-${userId.slice(0, 8)}`;
        localStorage.setItem("userName", userName);
      }
      
      // Identify user to the socket server
      socketInstance.emit("user.identify", {
        id: userId,
        name: userName,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
