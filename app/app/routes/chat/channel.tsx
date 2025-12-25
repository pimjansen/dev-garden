import Textarea from "~/sdk/Textarea";
import type { Route } from "./+types/channel";
import Message, { type IMessage } from "./components/Message";
import { Form } from "react-router";
import { useState, type FormEvent, useEffect, useRef } from "react";
import { useSocket } from "~/context/SocketContext";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import { prisma } from "~/lib/prisma";

export async function loader({ params }: Route.LoaderArgs) {
  const channel = await prisma.channel.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!channel) {
    throw new Response("Channel not found", { status: 404 });
  }

  return {
    channel: {
      id: channel.id,
      name: channel.name,
      created_at: channel.created_at,
    },
  };
}

export default function Channel({ loaderData }: Route.ComponentProps) {
  const { channel } = loaderData;
  const { socket: globalSocket } = useSocket();
  const params = useParams();
  const channelId = params.id;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [channelSocket, setChannelSocket] = useState<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Connect to channel namespace
  useEffect(() => {
    if (!channelId) return;

    const socket = io(`http://localhost:3000/channel/${channelId}`, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log(`Connected to channel namespace: /channel/${channelId}`);

      // Identify user to channel
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");

      if (userId && userName) {
        socket.emit("user.identify", {
          id: userId,
          name: userName,
        });
      }
    });

    setChannelSocket(socket);

    return () => {
      console.log(`Disconnecting from channel: /channel/${channelId}`);
      socket.close();
    };
  }, [channelId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for incoming messages on the channel
  useEffect(() => {
    if (!channelSocket) return;

    const handleChannelMessage = (data: {
      channelId: string;
      user: { id: string; name: string };
      message: string;
      timestamp: Date;
    }) => {
      console.log("Received channel message:", data);

      const newMessage: IMessage = {
        id: crypto.randomUUID(),
        message: data.message,
        createdAt: new Date(data.timestamp),
      };

      setMessages((prev) => [...prev, newMessage]);
    };

    channelSocket.on("channel.message", handleChannelMessage);

    return () => {
      channelSocket.off("channel.message", handleChannelMessage);
    };
  }, [channelSocket]);

  const createMessageHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const messageText = formData.get("message") as string;

    if (!messageText?.trim() || !channelSocket || !channelId) return;

    // Send to socket server (will receive back via channel.message event)
    channelSocket.emit("channel.message", {
      message: messageText,
    });

    // Reset input
    setCurrentInput("");
    e.currentTarget.reset();
  };

  return (
    <div className="relative flex flex-col h-full gap-8">
      <h1 className="font-bold text-2xl"># {channel.name}</h1>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <Message key={index} message={msg.message} />
        ))}
      </div>
      <div className="sticky w-full bottom-0 right-0">
        <Form onSubmit={createMessageHandler}>
          <Textarea
            onChange={(e) => setCurrentInput(e.currentTarget.value)}
            value={currentInput}
            name="message"
            placeholder="Enter your message"
            emojiPicker
          />
        </Form>
      </div>
    </div>
  );
}
