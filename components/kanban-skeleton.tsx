export function KanbanSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto w-full min-w-0 px-4 py-5 sm:p-6">
        <div className="mb-6 space-y-2">
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-56 max-w-full animate-pulse rounded-md bg-muted/60" />
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Loading your application stages…
        </p>
        <div className="kanban-scroll flex min-w-0 w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="kanban-column snap-start">
              <div className="h-12 animate-pulse rounded-t-lg bg-muted" />
              <div className="mt-1 h-[240px] animate-pulse rounded-b-lg bg-muted/60 sm:h-[320px] lg:h-[400px]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
