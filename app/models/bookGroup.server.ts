import type { BookGroup, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserBookGroups(id: User["id"]) {
  return prisma.bookGroup.findMany({
    where: {
      users: { some: { userId: id } },
    },
  });
}

export async function getBookGroup({
  userId,
  bookGroupId,
}: {
  userId: string;
  bookGroupId: string;
}) {
  return prisma.bookGroup.findFirst({
    where: {
      users: { some: { userId, bookGroupId } },
    },
  });
}

export async function createBookGroup(
  bookGroupData: Omit<BookGroup, "updatedAt" | "createdAt">
) {
  return prisma.bookGroup.create({
    data: {
      ...bookGroupData,
      users: { create: { userId: bookGroupData.creatorId } },
    },
  });
}
