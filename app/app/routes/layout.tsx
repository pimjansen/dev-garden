import Navbar from "~/components/Navbar";
// import KanbanBoard from "~/components/KanbanBoard";
import { Outlet, useNavigate, Link, useFetcher, redirect, Form } from "react-router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { Route } from "./+types/layout";
import { useSocket } from "~/context/SocketContext";
import { prisma } from "~/lib/prisma";
import Modal from "~/sdk/Modal";
import Button from "~/sdk/Button";
import TextField from "~/sdk/TextField";
import { authMiddleware } from "~/middleware/authMiddleware";
import { getUser } from "~/lib/auth";

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

export const middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const channels = await prisma.channel.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const user = getUser(context);

  return {
    channels,
    user,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { channels, user } = loaderData;
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [channelList, setChannelList] = useState<Channel[]>(channels);
  const [addChannelModalOpen, setAddChannelModalOpen] = useState<boolean>(false);
  const { isConnected, socket } = useSocket();
  const fetcher = useFetcher();

  // Close modal when form submission completes
  useEffect(() => {
    if (fetcher.state === "loading") {
      setAddChannelModalOpen(false);
    }
  }, [fetcher.state]);

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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Channels</h2>
            <button
              onClick={() => setAddChannelModalOpen(true)}
              className="cursor-pointer p-1 hover:bg-slate-700 rounded transition-colors"
              title="Add new channel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
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
        <Navbar user={user} />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>

      <Modal title="Add channel" onOpenChange={() => setAddChannelModalOpen(false)} open={addChannelModalOpen}>
        <fetcher.Form method="post" action="/chat/add-channel">
          <Modal.Body>
            <TextField name="name" label="Name" placeholder="My unique channel name" />
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Add channel</Button>
          </Modal.Footer>
        </fetcher.Form>
      </Modal>
    </div>
  );
}
