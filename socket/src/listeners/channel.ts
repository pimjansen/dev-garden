import { Server as SocketIOServer, Socket } from "socket.io";
import logger from "../logger";
import { User } from "../server";

interface Channel {
  id: string;
  users: Set<string>; // User IDs in this channel
}

const channels = new Map<string, Channel>(); // Map of all channels

const channelListener = (
  socket: Socket,
  io: SocketIOServer,
  connectedUsers: Map<string, User>,
  socketToUser: Map<string, string>
) => {
  // Join a channel room
  socket.on("channel.join", (data: { channelId: string }) => {
    const { channelId } = data;
    const userId = socketToUser.get(socket.id);

    if (!userId) {
      logger.log(`Socket '${socket.id}' tried to join channel '${channelId}' but user not identified`);
      return;
    }

    socket.join(channelId);

    // Initialize channel if it doesn't exist
    if (!channels.has(channelId)) {
      channels.set(channelId, {
        id: channelId,
        users: new Set(),
      });
    }

    const channel = channels.get(channelId)!;
    channel.users.add(userId);

    logger.log(`Socket '${socket.id}' (User: ${userId}) joined channel room '${channelId}'`);
  });

  // Leave a channel room
  socket.on("channel.leave", (data: { channelId: string }) => {
    const { channelId } = data;
    const userId = socketToUser.get(socket.id);

    if (!userId) return;

    socket.leave(channelId);

    const channel = channels.get(channelId);
    if (channel) {
      channel.users.delete(userId);
    }

    logger.log(`Socket '${socket.id}' left channel room '${channelId}'`);
  });

  // Handle channel messages
  socket.on("channel.message.create", (data: { channelId: string; message: string }) => {
    const { channelId, message } = data;
    const userId = socketToUser.get(socket.id);

    if (!userId) return;

    const user = connectedUsers.get(userId);
    if (!user) return;

    logger.log(`User '${user.name}' sending message to channel '${channelId}': ${message}`);

    // Broadcast message to all users in the channel room
    io.to(channelId).emit("channel.message.new", {
      channelId,
      user: {
        id: user.id,
        name: user.name,
      },
      message,
      timestamp: new Date(),
    });

    logger.log(`User '${user.name}' sent message in channel '${channelId}': ${message}`);
  });
};

export default channelListener;
