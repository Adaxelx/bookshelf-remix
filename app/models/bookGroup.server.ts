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
  prevSlug,
  ...bookGroupData
}: Omit<BookGroup, "updatedAt" | "createdAt" | "creatorId"> & {
  prevSlug: BookGroup["slug"];
}) {
  return prisma.bookGroup.update({
    where: { slug: prevSlug },
    data: bookGroupData,
  });
}

export async function deleteBookGroup(slug: BookGroup["slug"]) {
  return prisma.bookGroup.delete({
    where: { slug },
  });
}

export async function getBookGroupsForAdminUser(userId: User["id"]) {
  return prisma.bookGroup.findMany({
    where: { creatorId: userId },
    select: {
      slug: true,
    },
  });
}
