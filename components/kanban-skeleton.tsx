export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-hidden pb-4 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="min-w-[85vw] sm:min-w-[300px] flex-shrink-0">
          <div className="h-12 rounded-t-lg bg-gray-200 animate-pulse" />
          <div className="h-[400px] bg-gray-100 rounded-b-lg animate-pulse mt-1" />
        </div>
      ))}
    </div>
  );
}