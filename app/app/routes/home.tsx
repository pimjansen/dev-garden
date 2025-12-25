import Navbar from "~/components/Navbar";
import KanbanBoard from "~/components/KanbanBoard";
import type { Route } from "./+types/home";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <KanbanBoard />
    </div>
  );
}
