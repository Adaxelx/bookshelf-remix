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

export async function getBookByCategoryIdGroup({
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

export async function editBookGroup({
  previd,
  ...bookGroupData
}: Omit<BookGroup, "updatedAt" | "createdAt" | "creatorId"> & {
  previd: BookGroup["id"];
}) {
  return prisma.bookGroup.update({
    where: { id: previd },
    data: bookGroupData,
  });
}

export async function deleteBookGroup(id: BookGroup["id"]) {
  return prisma.bookGroup.delete({
    where: { id },
  });
}

export async function getBookGroupsForAdminUser(userId: User["id"]) {
  return prisma.bookGroup.findMany({
    where: { creatorId: userId },
    select: {
      id: true,
    },
  });
}
