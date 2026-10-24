import { prisma } from "./prisma";

const DEFAULT_COLUMNS = [
  {
    name: "Wish List",
    order: 0,
  },
  { name: "Applied", order: 1 },
  { name: "Interviewing", order: 2 },
  { name: "Offer", order: 3 },
  { name: "Rejected", order: 4 },
];

export async function initializeUserBoard(userId: string) {
  try {
    // Check if board already exists
    const existingBoard = await prisma.board.findUnique({
      where: {
        userId_name: {
          userId,
          name: "Job Hunt",
        },
      },
    });

    if (existingBoard) {
      return existingBoard;
    }

    // Create the board with columns in a transaction
    const board = await prisma.board.create({
      data: {
        name: "Job Hunt",
        userId,
        columns: {
          create: DEFAULT_COLUMNS.map((col) => ({
            name: col.name,
            order: col.order,
          })),
        },
      },
      include: {
        columns: true,
      },
    });

    return board;
  } catch (err) {
    throw err;
  }
}