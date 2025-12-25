import { useState } from "react";
import Column from "./Column";
import type { ITask } from "./Card";

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

export default function Board() {
  const [columns, setColumns] = useState<Column[]>(mockData);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 h-full">
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {columns.map((column) => (
            <Column key={column.id} tasks={column.tasks} title={column.title} />
          ))}
        </div>
      </div>
    </div>
  );
}
