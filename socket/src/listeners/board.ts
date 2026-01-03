import { Server as SocketIOServer, Socket } from "socket.io";
import logger from "../logger";
import { User } from "../server";

interface Board {
  id: string;
  users: Set<string>; // User IDs in this channel
}

const boards = new Map<string, Board>();

const boardListener = (
  socket: Socket,
  io: SocketIOServer,
  connectedUsers: Map<string, User>,
  socketToUser: Map<string, string>
) => {
  // Join a board room
  socket.on("board.join", ({ boardId }: { boardId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) {
      logger.warn(`Socket ${socket.id} tried to join board but user not identified`);
      return;
    }

    const user = connectedUsers.get(userId);
    if (!user) {
      logger.warn(`User ${userId} not found in connected users`);
      return;
    }

    socket.join(`board:${boardId}`);

    // Track users in the board
    if (!boards.has(boardId)) {
      boards.set(boardId, { id: boardId, users: new Set() });
    }
    boards.get(boardId)?.users.add(user.id);

    logger.info(`User ${user.name} (${user.id}) joined board ${boardId}`);
  });

  // Leave a board room
  socket.on("board.leave", ({ boardId }: { boardId: string }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = connectedUsers.get(userId);
    if (!user) return;

    socket.leave(`board:${boardId}`);

    // Remove user from board tracking
    const board = boards.get(boardId);
    if (board) {
      board.users.delete(user.id);
      if (board.users.size === 0) {
        boards.delete(boardId);
      }
    }

    // Notify other users that this user left
    socket.to(`board:${boardId}`).emit("board.user.left", { userId: user.id });

    logger.info(`User ${user.name} (${user.id}) left board ${boardId}`);
  });

  // Handle cursor movement
  socket.on("board.cursor.move", ({ boardId, x, y }: { boardId: string; x: number; y: number }) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) {
      logger.warn(`Socket ${socket.id} tried to move cursor but user not identified`);
      return;
    }

    const user = connectedUsers.get(userId);
    if (!user) {
      logger.warn(`User ${userId} not found in connected users`);
      return;
    }

    // logger.info(`User ${user.name} (${user.id}) moved cursor on board ${boardId} to (${x}, ${y})`);

    // Broadcast cursor position to all other users in the board room
    socket.to(`board:${boardId}`).emit("board.cursor.update", {
      userId: user.id,
      userName: user.name,
      x,
      y,
    });
  });

  // Handle disconnect - leave all board rooms
  socket.on("disconnect", () => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const user = connectedUsers.get(userId);
    if (!user) return;

    // Remove user from all boards and notify others
    boards.forEach((board, boardId) => {
      if (board.users.has(user.id)) {
        board.users.delete(user.id);
        socket.to(`board:${boardId}`).emit("board.user.left", { userId: user.id });

        if (board.users.size === 0) {
          boards.delete(boardId);
        }
      }
    });
  });
};

export default boardListener;
