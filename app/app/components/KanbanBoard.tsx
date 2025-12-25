import { useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  image?: string;
  assignees: string[];
  daysLeft?: number;
  status?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
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
        daysLeft: 5,
      },
      {
        id: "2",
        title: "Change homepage",
        description: "Change homepage for Volt Dashboard.",
        image: "https://placehold.co/400x200/e2e8f0/64748b?text=Task+Image",
        assignees: ["BG", "RC", "MG"],
        daysLeft: 22,
      },
      {
        id: "3",
        title: "Change charts javascript",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
        daysLeft: 7,
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
        daysLeft: 9,
      },
      {
        id: "5",
        title: "Redesign tables card",
        description:
          'In _variables.scss on line 672 you define $table_variants. Each instance of "color-level" needs to be changed to "shift-color".',
        assignees: ["BG", "RC", "MG"],
        daysLeft: 3,
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

function TaskCard({
  task,
  onDragStart,
}: {
  task: Task;
  onDragStart: (taskId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {task.title}
      </h3>

      {task.image && (
        <img
          src={task.image}
          alt={task.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
              title={assignee}
            >
              {assignee}
            </div>
          ))}
        </div>

        {task.daysLeft !== undefined ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {task.daysLeft} days left
          </span>
        ) : task.status ? (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            {task.status}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  onDragStart,
  onDrop,
  onDragOver,
}: {
  column: Column;
  onDragStart: (taskId: string) => void;
  onDrop: (columnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're leaving the column entirely
    if (
      e.currentTarget === e.target ||
      !e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      setIsDraggedOver(false);
    }
  };

  const handleDrop = () => {
    setIsDraggedOver(false);
    onDrop(column.id);
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div
        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all ${
          isDraggedOver
            ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : ""
        }`}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {column.title}
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded">
              {column.tasks.length}
            </span>
          </h2>
          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
          ))}
        </div>

        <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add new task
        </button>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(mockData);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTaskId) return;

    setColumns((prevColumns) => {
      // Find source column and task
      let draggedTask: Task | null = null;
      let sourceColumnId: string | null = null;

      for (const column of prevColumns) {
        const task = column.tasks.find((t) => t.id === draggedTaskId);
        if (task) {
          draggedTask = task;
          sourceColumnId = column.id;
          break;
        }
      }

      if (!draggedTask || !sourceColumnId) return prevColumns;

      // Don't do anything if dropping in the same column
      if (sourceColumnId === targetColumnId) return prevColumns;

      // Create new columns array with updated tasks
      return prevColumns.map((column) => {
        if (column.id === sourceColumnId) {
          // Remove task from source column
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== draggedTaskId),
          };
        } else if (column.id === targetColumnId) {
          // Add task to target column
          return {
            ...column,
            tasks: [...column.tasks, draggedTask!],
          };
        }
        return column;
      });
    });

    setDraggedTaskId(null);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
