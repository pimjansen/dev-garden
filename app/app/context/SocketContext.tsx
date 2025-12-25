import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouteLoaderData } from "react-router";
import type { IUser } from "./UserContext";

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

  // Try to get user from layout route (will be undefined on unauthenticated routes)
  const layoutData = useRouteLoaderData("routes/layout") as { user: IUser } | undefined;
  const user = layoutData?.user;

  useEffect(() => {
    // Only initialize socket on client side
    if (typeof window === "undefined") return;

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);

      // Use authenticated user if available, otherwise fallback to localStorage
      if (user) {
        // Identify authenticated user to the socket server
        socketInstance.emit("user.identify", {
          id: user.id,
          name: user.name,
          email: user.email,
          nickname: user.nickname,
        });
      } else {
        // Fallback for unauthenticated users (guest mode)
        let userId = localStorage.getItem("userId");
        let userName = localStorage.getItem("userName");

        if (!userId) {
          userId = crypto.randomUUID();
          localStorage.setItem("userId", userId);
        }

        if (!userName) {
          userName = `Guest-${userId.slice(0, 8)}`;
          localStorage.setItem("userName", userName);
        }

        socketInstance.emit("user.identify", {
          id: userId,
          name: userName,
        });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []); // Initialize socket only once

  // Separate effect to handle user identification (won't cause reconnection)
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Use authenticated user if available, otherwise fallback to localStorage
    if (user) {
      // Identify authenticated user to the socket server
      socket.emit("user.identify", {
        id: user.id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
      });
    } else {
      // Fallback for unauthenticated users (guest mode)
      let userId = localStorage.getItem("userId");
      let userName = localStorage.getItem("userName");

      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem("userId", userId);
      }

      if (!userName) {
        userName = `Guest-${userId.slice(0, 8)}`;
        localStorage.setItem("userName", userName);
      }

      socket.emit("user.identify", {
        id: userId,
        name: userName,
      });
    }
  }, [socket, isConnected, user?.id]); // Only re-identify when user ID actually changes

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
}
