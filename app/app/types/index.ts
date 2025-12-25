// Re-export Prisma types
export type { channel } from "@prisma/client";

// Socket event types
export interface SocketEvents {
  // "user.connected": { user: User; totalUsers: number; users: User[] };
  // "user.disconnected": { user: User; totalUsers: number; users: User[] };
  // "channel.message": { channelId: string; user: User; message: string; timestamp: Date };
  // "channel.created": { channel: Channel };
}

// Component types
// export interface MessageProps {
//   message: string;
//   userId: string;
//   timestamp: Date;
// }
