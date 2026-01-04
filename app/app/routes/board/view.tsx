import KanbanBoard from "~/components/KanbanBoard";
import type { Route } from "./+types/view";
import Board from "~/components/Board/Board";
import { prisma } from "~/lib/prisma";
export async function loader({ params }: Route.LoaderArgs) {
  const statuses = await prisma.task_status.findMany({
    orderBy: {
      sequence: "asc",
    },
  });

  const tasks = await prisma.task.findMany();

  return {
    statuses,
    tasks,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { statuses, tasks } = loaderData;

  return <Board boardId="main-board" statuses={statuses} tasks={tasks} />;
}
