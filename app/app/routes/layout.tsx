import Navbar from "~/components/Navbar";
// import KanbanBoard from "~/components/KanbanBoard";
import { Outlet, useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Route } from "./+types/layout";
import { useSocket } from "~/context/SocketContext";
import { prisma } from "~/lib/prisma";

type User = {
  id: string;
  name: string;
  connectedAt: Date;
};

type Channel = {
  id: string;
  name: string;
  createdAt: Date;
};

export async function loader() {
  const channels = await prisma.channel.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return {
    channels,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { channels } = loaderData;
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [channelList, setChannelList] = useState<Channel[]>(channels);
  const { isConnected, socket } = useSocket();
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // // Listen for new users connecting
    // socket.on("user.connected", (data: { user: { id: string; name: string }; totalUsers: number; users: any[] }) => {
    //   console.log("User connected:", data.user);
    //   setConnectedUsers(data.users);
    // });

    // // Listen for users disconnecting
    // socket.on("user.disconnected", (data: { user: { id: string; name: string }; totalUsers: number; users: any[] }) => {
    //   console.log("User disconnected:", data.user);
    //   setConnectedUsers(data.users);
    // });

    // // Listen for channels list
    // socket.on("channels.list", (data: { channels: Channel[] }) => {
    //   console.log("Channels list:", data.channels);
    //   setChannels(data.channels);
    // });

    // // Listen for new channel created
    // socket.on("channel.created", (data: { channel: Channel }) => {
    //   console.log("New channel created:", data.channel);
    //   setChannels((prev) => [...prev, data.channel]);
    // });

    return () => {
      socket.off("user.connected");
      socket.off("user.disconnected");
      socket.off("channels.list");
      socket.off("channel.created");
    };
  }, [socket]);

  return (
    <div className="flex h-screen">
      {/* Sidebar with connected users */}
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">Chat</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-slate-400">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        <div className="text-slate-300">
          <h2 className="text-lg font-bold mb-2">Channels</h2>
          <div className="mb-4">
            <ul>
              {channelList.map((channel) => (
                <li key={channel.id}>
                  <Link
                    to={`/chat/channel/${channel.id}`}
                    className="block rounded px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium"># {channel.name}</div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <h2 className="text-lg font-bold mb-2">Users</h2>
          {connectedUsers.length === 0 ? (
            <p className="text-slate-500 text-sm">No users connected</p>
          ) : (
            <ul className="space-y-2">
              {connectedUsers.map((user) => (
                <li
                  key={user.id}
                  className="rounded px-3 py-2 text-sm relative group cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <img src="https://placehold.co/24x24" alt={user.name} className="w-6 h-6 rounded-md mr-2" />
                    <div>{user.name}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
