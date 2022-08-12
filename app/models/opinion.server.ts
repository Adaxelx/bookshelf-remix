import type { Book, Opinion } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getOpinions(bookId: Book["slug"]) {
  return prisma.opinion.findMany({
    where: {
      bookId: bookId,
    },
    select: {
      rate: true,
      description: true,
      id: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function addOpinion(
  opinionData: Omit<Opinion, "updatedAt" | "createdAt" | "id">
) {
  return prisma.opinion.create({
    data: opinionData,
  });
}
