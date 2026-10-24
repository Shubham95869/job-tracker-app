import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/kanban-board";
import { Suspense } from "react";
import { KanbanSkeleton } from "@/components/kanban-skeleton";

async function getBoard(userId: string) {
  "use cache";

  const board = await prisma.board.findUnique({
    where: {
      userId_name: {
        userId,
        name: "Job Hunt",
      },
    },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          jobApplications: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  return board;
}

async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const board = await getBoard(session?.user.id ?? "");


  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto w-full min-w-0 px-4 py-5 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Job Hunt</h1>
          <p className="text-muted-foreground">Track your job applications</p>
        </div>
        <KanbanBoard board={board} />
      </div>
    </main>
  );
}

export default async function Dashboard() {
  return (
    <Suspense fallback={<KanbanSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
