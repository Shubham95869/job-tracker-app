"use client";

import { Column, JobApplication, BoardOrNull } from "@/lib/models/models.types";
import {
  Award,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  Mic,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoards";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface KanbanBoardProps {
  board: BoardOrNull;
}

interface ColConfig {
  color: string;
  icon: React.ReactNode;
}
const COLUMN_CONFIG: Array<ColConfig> = [
  {
    color: "bg-cyan-700",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    color: "bg-violet-700",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    color: "bg-emerald-700",
    icon: <Mic className="h-4 w-4" />,
  },
  {
    color: "bg-amber-700",
    icon: <Award className="h-4 w-4" />,
  },
  {
    color: "bg-rose-700",
    icon: <XCircle className="h-4 w-4" />,
  },
];

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });

  const sortedJobs = [...(column.jobApplications || [])].sort(
    (a, b) => a.order - b.order
  );
  return (
    <Card className="kanban-column snap-start p-0 shadow-md">
      <CardHeader
        className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-base font-semibold">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20"
                aria-label={`Actions for ${column.name} column`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className={`min-h-[240px] space-y-2 rounded-b-lg bg-muted/50 pt-4 sm:min-h-[320px] lg:min-h-[400px] ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <SortableContext
          items={sortedJobs.map((job) => job.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedJobs.map((job) => (
            <SortableJobCard
              key={job.id}
              job={{ ...job, columnId: job.columnId || column.id }}
              columns={sortedColumns}
            />
          ))}
        </SortableContext>

        <CreateJobApplicationDialog columnId={column.id} boardId={boardId} />
      </CardContent>
    </Card>
  );
}

function SortableJobCard({
  job,
  columns,
}: {
  job: JobApplication;
  columns: Column[];
}) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef,
  } = useSortable({
    id: job.id,
    data: {
      type: "job",
      job,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <JobApplicationCard
        job={job}
        columns={columns}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { columns, error, moveJob } = useBoard(board);

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!board) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  async function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let draggedJob: JobApplication | null = null;
    let sourceColumn: Column | null = null;
    let sourceIndex = -1;

    for (const column of sortedColumns) {
      const jobs =
        [...column.jobApplications].sort((a, b) => a.order - b.order);
      const jobIndex = jobs.findIndex((j) => j.id === activeId);
      if (jobIndex !== -1) {
        draggedJob = jobs[jobIndex];
        sourceColumn = column;
        sourceIndex = jobIndex;
        break;
      }
    }

    if (!draggedJob || !sourceColumn) return;

    // Check if dropped in a column or another job
    const targetColumn = sortedColumns.find((col) => col.id === overId);
    const targetJob = sortedColumns
      .flatMap((col) => col.jobApplications || [])
      .find((job) => job.id === overId);

    let targetColumnId: string;
    let newOrder: number;

    if (targetColumn) {
      targetColumnId = targetColumn.id;
      const jobsInTarget = [...targetColumn.jobApplications]
        .filter((j) => j.id !== activeId)
        .sort((a, b) => a.order - b.order);
      newOrder = jobsInTarget.length;
    } else if (targetJob) {
      const targetJobColumn = sortedColumns.find((col) =>
        col.jobApplications.some((j) => j.id === targetJob.id)
      );
      targetColumnId = targetJob.columnId || targetJobColumn?.id || "";
      if (!targetColumnId) return;

      const targetColumnObj = sortedColumns.find(
        (col) => col.id === targetColumnId
      );

      if (!targetColumnObj) return;

      const allJobsInTargetOriginal = [...targetColumnObj.jobApplications].sort(
        (a, b) => a.order - b.order
      );

      const allJobsInTargetFiltered =
        allJobsInTargetOriginal.filter((j) => j.id !== activeId) || [];

      const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(
        (j) => j.id === overId
      );

      const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(
        (j) => j.id === overId
      );

      if (targetIndexInFiltered !== -1) {
        if (sourceColumn.id === targetColumnId) {
          if (sourceIndex < targetIndexInOriginal) {
            newOrder = targetIndexInFiltered + 1;
          } else {
            newOrder = targetIndexInFiltered;
          }
        } else {
          newOrder = targetIndexInFiltered;
        }
      } else {
        newOrder = allJobsInTargetFiltered.length;
      }
    } else {
      return;
    }

    if (!targetColumnId) {
      return;
    }

    await moveJob(activeId, targetColumnId, newOrder);
  }

  const activeJob = sortedColumns
    .flatMap((col) => col.jobApplications || [])
    .find((job) => job.id === activeId);
  return (
    <DndContext
      id={`DndDescribedBy-${board.id}`}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-w-0 space-y-3">
        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight aria-hidden="true" className="size-4 shrink-0" />
          <span className="sm:hidden">Swipe horizontally to view every stage.</span>
          <span className="hidden sm:inline">Scroll horizontally to view every stage.</span>
        </p>
        <div
          role="region"
          aria-label="Application stages"
          tabIndex={0}
          className="kanban-scroll min-w-0 w-full flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
        >
          {sortedColumns.map((col, key) => {
            const config = COLUMN_CONFIG[key] || {
              color: "bg-slate-700",
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={col.id}
                column={col}
                config={config}
                boardId={board!.id}
                sortedColumns={sortedColumns}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="opacity-50">
            <JobApplicationCard job={activeJob} columns={sortedColumns} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
