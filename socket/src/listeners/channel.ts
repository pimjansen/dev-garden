import { Server as SocketIOServer, Socket } from "socket.io";
import logger from "../logger";
import { User } from "../server";

interface Channel {
  id: string;
  name: string;
  users: Map<string, User>; // Users in this channel
  createdAt: Date;
}

const channels = new Map<string, Channel>(); // Map of all channels
const socketToUser = new Map<string, string>(); // Map socket ID to user ID

// Create default channels
const defaultChannels = ["general", "random"];
defaultChannels.forEach((channelName) => {
  const channelId = channelName;
  channels.set(channelId, {
    id: channelId,
    name: channelName,
    users: new Map(),
    createdAt: new Date(),
  });
});

// Helper function to get channel users
const getChannelUsers = (channelId: string) => {
  const channel = channels.get(channelId);
  if (!channel) return [];
  return Array.from(channel.users.values()).map((u) => ({
    id: u.id,
    name: u.name,
  }));
};

// Helper function to get all channels with user counts
export const getChannelsList = () => {
  return Array.from(channels.values()).map((c) => ({
    id: c.id,
    name: c.name,
    createdAt: c.createdAt,
  }));
};

const channelListener = (socket: Socket, io: SocketIOServer, connectedUsers: Map<string, User>) => {
  // Get list of available channels
  socket.on("channels.list", () => {
    socket.emit("channels.list", {
      channels: getChannelsList(),
    });
  });

  // Create a new channel
  socket.on("channel.create", (data: { name: string }) => {
    const channelId = data.name.toLowerCase().replace(/\s+/g, "-");

    if (channels.has(channelId)) {
      socket.emit("error", { message: "Channel already exists" });
      return;
    }

    const newChannel: Channel = {
      id: channelId,
      name: data.name,
      users: new Map(),
      createdAt: new Date(),
    };

    channels.set(channelId, newChannel);

    // Broadcast new channel to all clients
    io.emit("channel.created", {
      channel: {
        id: newChannel.id,
        name: newChannel.name,
        createdAt: newChannel.createdAt,
      },
    });

    logger.log(`Channel '${newChannel.name}' created`);
  });
};

// Setup dynamic namespace for channels
export const setupChannelNamespaces = (io: SocketIOServer, connectedUsers: Map<string, User>) => {
  const channelNamespace = io.of(/^\/channel\/[\w-]+$/);

  channelNamespace.on("connection", (socket) => {
    const namespace = socket.nsp.name; // e.g., /channel/general
    const channelId = namespace.replace("/channel/", "");

    logger.log(
      `Socket '${socket.id}' connected to channel namespace '${namespace}'`
    );

    // User identification in channel
    socket.on("user.identify", (data: { id: string; name: string }) => {
      const channel = channels.get(channelId);
      if (!channel) {
        socket.emit("error", { message: "Channel not found" });
        return;
      }

      const existingGlobalUser = connectedUsers.get(data.id);
      let user: User;

      if (existingGlobalUser) {
        user = existingGlobalUser;
        user.sockets.add(socket.id);
      } else {
        user = {
          id: data.id,
          name: data.name,
          sockets: new Set([socket.id]),
          connectedAt: new Date(),
        };
        connectedUsers.set(data.id, user);
      }

      socketToUser.set(socket.id, data.id);

      // Add user to channel
      const wasInChannel = channel.users.has(data.id);
      channel.users.set(data.id, user);

      if (!wasInChannel) {
        // Notify all users in this channel about the new member
        socket.nsp.emit("channel.user.joined", {
          channelId: channel.id,
          user: {
            id: user.id,
            name: user.name,
          },
          users: getChannelUsers(channelId),
        });

        logger.log(
          `User '${user.name}' (${user.id}) joined channel '${channel.name}'`
        );
      } else {
        // Just send current state to the reconnecting socket
        socket.emit("channel.user.joined", {
          channelId: channel.id,
          user: {
            id: user.id,
            name: user.name,
          },
          users: getChannelUsers(channelId),
        });
      }
    });

    // Handle channel messages
    socket.on("channel.message", (data: { message: string }) => {
      const userId = socketToUser.get(socket.id);
      if (!userId) return;

      const user = connectedUsers.get(userId);
      if (!user) return;

      // Broadcast message to all users in the channel
      socket.nsp.emit("channel.message", {
        channelId,
        user: {
          id: user.id,
          name: user.name,
        },
        message: data.message,
        timestamp: new Date(),
      });

      logger.log(
        `User '${user.name}' sent message in channel '${channelId}': ${data.message}`
      );
    });

    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);

      if (userId) {
        const user = connectedUsers.get(userId);
        const channel = channels.get(channelId);

        if (user && channel) {
          user.sockets.delete(socket.id);
          socketToUser.delete(socket.id);

          // Check if user has any other sockets in this channel's namespace
          const hasOtherSocketsInChannel = Array.from(user.sockets).some(
            (sid) => {
              const sock = socket.nsp.sockets.get(sid);
              return sock !== undefined;
            }
          );

          if (!hasOtherSocketsInChannel) {
            // Remove user from channel
            channel.users.delete(userId);

            // Notify channel about user leaving
            socket.nsp.emit("channel.user.left", {
              channelId: channel.id,
              user: {
                id: user.id,
                name: user.name,
              },
              users: getChannelUsers(channelId),
            });

            logger.log(
              `User '${user.name}' (${user.id}) left channel '${channel.name}'`
            );
          }
        }
      }
    });
  });
};

export default channelListener;
