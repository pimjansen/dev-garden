import KanbanBoard from "~/components/KanbanBoard";
import type { Route } from "./+types/view";
import Board from "~/components/Board/Board";

export default function Home() {
  return <Board boardId="main-board" />;
}
