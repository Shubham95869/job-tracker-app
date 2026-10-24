"use client";

import { useState } from "react";
import { Column, JobApplication, BoardOrNull } from "../models/models.types";
import { updateJobApplication } from "../actions/job-applications";

export function useBoard(initialBoard?: BoardOrNull) {
  const board = initialBoard ?? null;
  const [optimisticState, setOptimisticState] = useState<{
    board: BoardOrNull;
    columns: Column[];
  } | null>(null);
  const columns =
    optimisticState?.board === board
      ? optimisticState.columns
      : board?.columns || [];
  const [error, setError] = useState<string | null>(null);

  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const previousColumns = columns;
    setError(null);

    const newColumns = previousColumns.map((col) => ({
      ...col,
      jobApplications: [...col.jobApplications],
    }));

    // Find and remove job from the old column.

    let jobToMove: JobApplication | null = null;
    let oldColumnId: string | null = null;

    for (const col of newColumns) {
      const jobIndex = col.jobApplications.findIndex(
        (j) => j.id === jobApplicationId
      );
      if (jobIndex !== -1) {
        jobToMove = col.jobApplications[jobIndex];
        oldColumnId = col.id;
        col.jobApplications = col.jobApplications.filter(
          (job) => job.id !== jobApplicationId
        );
        break;
      }
    }

    if (jobToMove && oldColumnId) {
      const targetColumnIndex = newColumns.findIndex(
        (col) => col.id === newColumnId
      );
      if (targetColumnIndex !== -1) {
        const targetColumn = newColumns[targetColumnIndex];
        const updatedJobs = [...targetColumn.jobApplications];
        updatedJobs.splice(newOrder, 0, {
          ...jobToMove,
          columnId: newColumnId,
          order: newOrder * 100,
        });

        const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
          ...job,
          order: idx * 100,
        }));

        newColumns[targetColumnIndex] = {
          ...targetColumn,
          jobApplications: jobsWithUpdatedOrders,
        };
      }
    }

    setOptimisticState({ board, columns: newColumns });

    try {
      const result = await updateJobApplication(jobApplicationId, {
        columnId: newColumnId,
        order: newOrder,
      });
      if (result.error) {
        setOptimisticState({ board, columns: previousColumns });
        setError(result.error);
      }
    } catch {
      setOptimisticState({ board, columns: previousColumns });
      setError("Could not save the new application position. Please try again.");
    }
  }

  return { board, columns, error, moveJob };
}
