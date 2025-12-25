import Card from "./Card";

interface IProps {
  title: string;
  tasks: ITask[];
}

export default function Column({ title, tasks }: IProps) {
  return (
    <div className="shrink-0 min-w-80 max-w-100">
      <div
        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all`}
        // onDrop={handleDrop}
        // onDragOver={onDragOver}
        // onDragEnter={handleDragEnter}
        // onDragLeave={handleDragLeave}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {title}
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded">
              {tasks.length}
            </span>
          </h2>
          {/* <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
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
          </button> */}
        </div>

        <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {tasks.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </div>

        <button className="cursor-pointer w-full mt-4 border border-dashed py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
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
