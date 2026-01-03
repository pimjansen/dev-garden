import { useState, useEffect } from "react";
import Column from "./Column";
import type { ITask } from "./Card";
import { useSocket } from "~/context/SocketContext";

interface Column {
  id: string;
  title: string;
  tasks: ITask[];
}

const mockData: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Change charts javascript",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
      },
      {
        id: "2",
        title: "Change homepage",
        description: "Change homepage for Volt Dashboard.",
        image: "https://placehold.co/400x200/e2e8f0/64748b?text=Task+Image",
        assignees: ["BG", "RC", "MG"],
      },
      {
        id: "3",
        title: "Change charts javascript",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "4",
        title: "Redesign tables card",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        image: "https://placehold.co/400x200/dbeafe/3b82f6?text=Task+Image",
        assignees: ["BG", "RC", "MG"],
      },
      {
        id: "5",
        title: "Redesign tables card",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "6",
        title: "Redesign tables card",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        image: "https://placehold.co/400x200/dcfce7/22c55e?text=Task+Image",
        assignees: ["BG", "RC", "MG"],
        status: "Done",
      },
      {
        id: "7",
        title: "Redesign tables card",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
        status: "Done",
      },
      {
        id: "8",
        title: "Create Javascript elements",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
        status: "Done",
      },
    ],
  },
];

type Cursor = {
  userId: string;
  userName: string;
  x: number;
  y: number;
};

interface BoardProps {
  boardId?: string;
}

export default function Board({ boardId = "default" }: BoardProps) {
  const [columns, setColumns] = useState<Column[]>(mockData);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [userIdentified, setUserIdentified] = useState(false);
  const { socket } = useSocket();

  // Wait for user identification
  useEffect(() => {
    if (!socket) return;

    socket.on("user.connected", () => {
      console.log("User identified on socket");
      setUserIdentified(true);
    });

    return () => {
      socket.off("user.connected");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !userIdentified) {
      console.log("Waiting for socket and user identification", { socket: !!socket, userIdentified });
      return;
    }

    // Join the board-specific room
    socket.emit("board.join", { boardId });
    console.log("Joined board:", boardId);

    // Listen for cursor updates from other users
    socket.on("board.cursor.update", (data: Cursor) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: data,
      }));
    });

    // Listen for users leaving
    socket.on("board.user.left", (data: { userId: string }) => {
      console.log("User left board:", data.userId);
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    });

    return () => {
      socket.emit("board.leave", { boardId });
      socket.off("board.cursor.update");
      socket.off("board.user.left");
    };
  }, [socket, boardId, userIdentified]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!socket) return;

    // Get the board container's position
    const rect = e.currentTarget.getBoundingClientRect();

    // Calculate position relative to the board container, accounting for scroll
    const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;

    // Emit cursor position to other users in the board room
    socket.emit("board.cursor.move", {
      boardId,
      x,
      y,
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 h-full relative" onMouseMove={handleMouseMove}>
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {columns.map((column) => (
            <Column key={column.id} tasks={column.tasks} title={column.title} />
          ))}
        </div>
      </div>
      {/* Render other users' cursors */}
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.65376 12.3673L8.82672 15.5403L12.9342 7.92726L5.65376 12.3673Z"
              fill="currentColor"
              className="text-blue-500"
            />
          </svg>
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded ml-2 mt-1 whitespace-nowrap">
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
}
