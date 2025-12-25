interface IProps {
  task: ITask;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  image?: string;
  assignees: string[];
  status?: string;
}

export default function Card({ task }: IProps) {
  return (
    <div
      // draggable
      // onDragStart={() => onDragStart(task.id)}
      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {task.title}
      </h3>

      {/* {task.image && (
        <img
          src={task.image}
          alt={task.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )} */}

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
              title={assignee}
            >
              {assignee}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
