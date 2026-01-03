import TextArea from "~/sdk/TextArea";
import type { Route } from "./+types/channel";
import Message, { type IMessage } from "./components/Message";
import { Await, data, Form, useFetcher, useRouteLoaderData } from "react-router";
import { useState, type FormEvent, useEffect, useRef } from "react";
import { useSocket } from "~/context/SocketContext";
import { prisma } from "~/lib/prisma";
import { uuidv7 } from "uuidv7";
import React from "react";
import { getUser } from "~/lib/auth";

export function shouldRevalidate({ formAction, defaultShouldRevalidate }: Route.ShouldRevalidateArgs) {
  if (formAction) {
    return false;
  }
  return defaultShouldRevalidate;
}

export async function action({ context, request, params }: Route.ActionArgs) {
  const user = getUser(context);
  const formData = await request.formData();
  const content = formData.get("message") as string;

  if (!content?.trim()) {
    return data({ error: "Message and user ID required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      id: uuidv7(),
      channel_id: params.id,
      content,
      user_id: user.id,
      created_at: new Date(),
    },
  });

  return { id: message.id, success: true };
}

export async function loader({ params }: Route.LoaderArgs) {
  const channel = await prisma.channel.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!channel) {
    throw new Response("Channel not found", { status: 404 });
  }

  const messagesPromise = Promise.resolve(
    prisma.message.findMany({
      where: {
        channel_id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    })
  );

  return {
    messagesPromise,
    channel: {
      id: channel.id,
      name: channel.name,
      created_at: channel.created_at,
    },
  };
}

export default function Channel({ loaderData }: Route.ComponentProps) {
  const { channel, messagesPromise } = loaderData;
  const { user } = useRouteLoaderData("routes/layout");
  const { socket, isConnected } = useSocket();
  const channelId = channel.id;

  const fetcher = useFetcher();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    messagesPromise.then((resolvedMessages) => {
      setMessages(resolvedMessages);
    });
  }, [messagesPromise]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Join channel room (only when socket is connected)
  useEffect(() => {
    if (!socket || !isConnected || !channelId) return;

    console.log(`Joining channel room: ${channelId}`);
    socket.emit("channel.join", { channelId });

    return () => {
      console.log(`Leaving channel room: ${channelId}`);
      socket.emit("channel.leave", { channelId });
    };
  }, [socket, isConnected, channelId]);

  // Listen for incoming messages on the channel
  useEffect(() => {
    if (!socket) return;

    const handleChannelMessage = (data: {
      channelId: string;
      user: { id: string; name: string };
      message: string;
      timestamp: Date;
    }) => {
      console.log(data);
      // Add new message to state
      const newMessage = {
        id: crypto.randomUUID(), // Temporary ID
        content: data.message,
        user: {
          id: data.user.id,
          name: data.user.name,
        },
        created_at: new Date(data.timestamp),
        channel_id: channelId,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Show browser notification if window is not focused
      if ("Notification" in window && Notification.permission === "granted" && !document.hasFocus()) {
        new Notification(`New message from ${data.user.name}`, {
          body: data.message,
          icon: "/favicon.ico", // Optional: add your app icon
          tag: `channel-${channelId}`, // Prevents duplicate notifications
        });
      }
    };

    socket.on("channel.message.new", handleChannelMessage);

    return () => {
      socket.off("channel.message.new", handleChannelMessage);
    };
  }, [socket, channelId, fetcher]);

  const createMessageHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const messageText = formData.get("message") as string;

    if (!messageText?.trim()) {
      return;
    }

    // Submit to action to store in database
    fetcher.submit(formData, { method: "POST" });

    // Also send via socket for real-time broadcast
    if (socket) {
      socket.emit("channel.message.create", {
        channelId,
        message: messageText,
      });
    }

    // Reset input
    setCurrentInput("");
    e.currentTarget.reset();
  };

  const shouldBeMappedToPrevious = (current: IMessage, previous: IMessage | undefined) => {
    if (!previous) {
      return false;
    }
    if (current.user.id === previous.user.id) {
      return true;
    }
    return false;
  };

  return (
    <div className="relative flex flex-col h-full gap-8">
      <h1 className="font-bold text-2xl"># {channel.name}</h1>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <React.Suspense fallback={<p>loading</p>}>
          <Await resolve={messagesPromise} errorElement={<div>Could not load messages 😬</div>}>
            {(resolvedMessages) => {
              if (messages.length === 0) {
                return (
                  <div className="w-full h-full flex justify-center items-center dark:text-slate-200">
                    Be the first one to leave a comment!
                  </div>
                );
              }
              let prevMessage: undefined | IMessage = undefined;
              return messages.map((msg) => {
                return messages.map((msg) => {
                  const element = (
                    <Message
                      mapToPrevious={shouldBeMappedToPrevious(msg, prevMessage)}
                      key={msg.id}
                      date={msg.created_at}
                      by={msg.user.name}
                      message={msg.content}
                    />
                  );
                  prevMessage = msg;
                  return element;
                });
              });
            }}
          </Await>
        </React.Suspense>
      </div>
      <div className="sticky w-full bottom-0 right-0">
        <fetcher.Form method="POST" onSubmit={createMessageHandler}>
          <TextArea
            onChange={(e) => setCurrentInput(e.currentTarget.value)}
            value={currentInput}
            name="message"
            placeholder="Enter your message"
            emojiPicker
          />
        </fetcher.Form>
      </div>
    </div>
  );
}
