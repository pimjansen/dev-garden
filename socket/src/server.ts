import { createServer } from "http";
import { Server } from "socket.io";
// import createAdapter from "./services/redis.js";
import invariant from "tiny-invariant";
import dotenv from "dotenv";
// import registerSocketUi from "./services/socket_ui.js";
import logger from "./logger";
import channelListener from "./listeners/channel";
// import debugListener from "./listeners/debugListener.js";
// import notificationListener from "./listeners/notificationListener.js";
// import middleware from "./middleware/index.js";
// import chatListener from "./listeners/chatListener.js";
// import taakListener from "./listeners/taakListener.js";
// import gebruikerListener from "./listeners/gebruikerListener.js";

dotenv.config();

invariant(process.env.APP_PORT, "variable APP_PORT is not set");
invariant(process.env.CORS_HOSTS, "variable CORS_HOSTS is not set");
const APP_PORT = process.env.APP_PORT ?? 3000;

let serverOptions = {
  cors: {
    origin: process.env.CORS_HOSTS.split(",").map(function (value) {
      return value;
    }),
  },
};

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("Healthy");
  } else if (req.url === "/ready") {
    res.writeHead(200);
    res.end("Ready");
  }
});
const io = new Server(httpServer, serverOptions);

export interface User {
  id: string;
  name: string;
  sockets: Set<string>; // Track multiple socket connections
  connectedAt: Date;
}

const connectedUsers = new Map<string, User>(); // Map by user ID (global)
const socketToUser = new Map<string, string>(); // Map socket ID to user ID

// Helper function to get unique users list
const getUniqueUsers = () => {
  return Array.from(connectedUsers.values()).map((u) => ({
    id: u.id,
    name: u.name,
    socketCount: u.sockets.size,
  }));
};

// Connection
io.on("connection", (socket) => {
  logger.log(
    `Socket '${socket.id}' connected on namespace '${socket.nsp.name}'`
  );

  channelListener(socket, io, connectedUsers, socketToUser);

  // Wait for user to identify themselves
  socket.on("user.identify", (data: { id: string; name: string }) => {
    const existingUser = connectedUsers.get(data.id);

    if (existingUser) {
      // User already connected from another tab
      existingUser.sockets.add(socket.id);
      socketToUser.set(socket.id, data.id);
      logger.log(`User '${existingUser.name}' (${existingUser.id}) connected from additional tab. Total tabs: ${existingUser.sockets.size}`);

      // Send current users list to the newly connected socket
      socket.emit("user.connected", {
        user: {
          id: existingUser.id,
          name: existingUser.name,
        },
        totalUsers: connectedUsers.size,
        users: getUniqueUsers(),
      });
    } else {
      // New user connection
      const user: User = {
        id: data.id,
        name: data.name,
        sockets: new Set([socket.id]),
        connectedAt: new Date(),
      };

      connectedUsers.set(data.id, user);
      socketToUser.set(socket.id, data.id);

      // Notify all clients about the new user
      io.emit("user.connected", {
        user: {
          id: user.id,
          name: user.name,
        },
        totalUsers: connectedUsers.size,
        users: getUniqueUsers(),
      });

      logger.log(`User '${user.name}' (${user.id}) identified. Total connected users: ${connectedUsers.size}`);
    }
  });

  socket.on("join", (payload) => {
    logger.log(`Socket '${socket.id}' joined room '${payload}'`);
    socket.join(payload);
  });

  socket.on("leave", (payload) => {
    logger.log(`Socket '${socket.id}' left room '${payload}'`);
    socket.leave(payload);
  });

  socket.on("error", (err) => {
    logger.error(err.message);
  });

  socket.on("disconnect", function () {
    const userId = socketToUser.get(socket.id);

    if (userId) {
      const user = connectedUsers.get(userId);

      if (user) {
        // Remove this socket from the user's socket set
        user.sockets.delete(socket.id);
        socketToUser.delete(socket.id);

        if (user.sockets.size === 0) {
          // User has no more connections, remove completely
          connectedUsers.delete(userId);

          // Notify all remaining clients about the disconnection
          io.emit("user.disconnected", {
            user: {
              id: user.id,
              name: user.name,
            },
            totalUsers: connectedUsers.size,
            users: getUniqueUsers(),
          });

          logger.log(
            `User '${user.name}' (${user.id}) fully disconnected from namespace '${socket.nsp.name}'`
          );
          logger.log(`Total connected users: ${connectedUsers.size}`);
        } else {
          logger.log(
            `Socket '${socket.id}' disconnected. User '${user.name}' (${user.id}) still has ${user.sockets.size} active connection(s)`
          );
        }
      }
    } else {
      logger.log(
        `Socket '${socket.id}' disconnected from namespace '${socket.nsp.name}' (user was not identified)`
      );
    }
  });
});

httpServer.listen(APP_PORT, () => {
  logger.log("Socket.IO listening on port " + APP_PORT);
});
