"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import { prisma } from "../prisma";

interface JobApplicationData {
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description?: string;
}

export async function createJobApplication(data: JobApplicationData) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const {
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    columnId,
    boardId,
    tags,
    description,
  } = data;

  if (!company || !position || !columnId || !boardId) {
    return { error: "Missing required fields" };
  }

  // Verify board ownership
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
      userId: session.user.id,
    },
  });

  if (!board) {
    return { error: "Board not found" };
  }

  // Verify column belongs to board
  const column = await prisma.column.findUnique({
    where: {
      id: columnId,
      boardId: boardId,
    },
  });

  if (!column) {
    return { error: "Column not found" };
  }

  // Get max order in column
  const maxOrder = await prisma.jobApplication.findFirst({
    where: { columnId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const jobApplication = await prisma.jobApplication.create({
    data: {
      company,
      position,
      location,
      notes,
      salary,
      jobUrl,
      columnId,
      boardId,
      userId: session.user.id,
      tags: tags || [],
      description,
      status: "applied",
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  revalidatePath("/dashboard");

  return { data: jobApplication };
}

export async function updateJobApplication(
  id: string,
  updates: {
    company?: string;
    position?: string;
    location?: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    columnId?: string;
    order?: number;
    tags?: string[];
    description?: string;
  }
) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const jobApplication = await prisma.jobApplication.findUnique({
    where: { id },
  });

  if (!jobApplication) {
    return { error: "Job application not found" };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  const { columnId, order, ...otherUpdates } = updates;

  const updatesToApply: Partial<{
    company: string;
    position: string;
    location: string;
    notes: string;
    salary: string;
    jobUrl: string;
    columnId: string;
    order: number;
    tags: string[];
    description: string;
  }> = otherUpdates;

  const currentColumnId = jobApplication.columnId;
  const newColumnId = columnId;

  const isMovingToDifferentColumn =
    newColumnId && newColumnId !== currentColumnId;

  if (isMovingToDifferentColumn) {
    const jobsInTargetColumn = await prisma.jobApplication.findMany({
      where: {
        columnId: newColumnId,
        id: { not: id },
      },
      orderBy: { order: 'asc' },
    });

    let newOrderValue: number;

    if (order !== undefined && order !== null) {
      newOrderValue = order * 100;

      const jobsThatNeedToShift = jobsInTargetColumn.slice(order);
      for (const job of jobsThatNeedToShift) {
        await prisma.jobApplication.update({
          where: { id: job.id },
          data: { order: job.order + 100 },
        });
      }
    } else {
      if (jobsInTargetColumn.length > 0) {
        const lastJobOrder =
          jobsInTargetColumn[jobsInTargetColumn.length - 1].order || 0;
        newOrderValue = lastJobOrder + 100;
      } else {
        newOrderValue = 0;
      }
    }

    updatesToApply.columnId = newColumnId;
    updatesToApply.order = newOrderValue;
  } else if (order !== undefined && order !== null) {
    const otherJobsInColumn = await prisma.jobApplication.findMany({
      where: {
        columnId: currentColumnId,
        id: { not: id },
      },
      orderBy: { order: 'asc' },
    });

    const currentJobOrder = jobApplication.order || 0;
    const currentPositionIndex = otherJobsInColumn.findIndex(
      (job) => job.order > currentJobOrder
    );
    const oldPositionindex =
      currentPositionIndex === -1
        ? otherJobsInColumn.length
        : currentPositionIndex;

    const newOrderValue = order * 100;

    if (order < oldPositionindex) {
      const jobsToShiftDown = otherJobsInColumn.slice(order, oldPositionindex);

      for (const job of jobsToShiftDown) {
        await prisma.jobApplication.update({
          where: { id: job.id },
          data: { order: job.order + 100 },
        });
      }
    } else if (order > oldPositionindex) {
      const jobsToShiftUp = otherJobsInColumn.slice(oldPositionindex, order);
      for (const job of jobsToShiftUp) {
        const newOrder = Math.max(0, job.order - 100);
        await prisma.jobApplication.update({
          where: { id: job.id },
          data: { order: newOrder },
        });
      }
    }

    updatesToApply.order = newOrderValue;
  }

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: updatesToApply,
  });

  revalidatePath("/dashboard");

  return { data: updated };
}

export async function deleteJobApplication(id: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const jobApplication = await prisma.jobApplication.findUnique({
    where: { id },
  });

  if (!jobApplication) {
    return { error: "Job application not found" };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  await prisma.jobApplication.delete({
    where: { id },
  });

  revalidatePath("/dashboard");

  return { success: true };
}