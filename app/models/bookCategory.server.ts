import type { BookCategory, BookGroup } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getCategories(bookGroupId: BookGroup["id"]) {
  return prisma.bookCategory.findMany({
    where: {
      bookGroupId,
    },
  });
}

export async function getCategory(categoryid: BookCategory["id"]) {
  return prisma.bookCategory.findFirst({
    where: {
      id: categoryid,
    },
    select: {
      imageId: true,
    },
  });
}

export async function setActiveCategory(categoryid: BookCategory["id"]) {
  return prisma.bookCategory.update({
    where: {
      id: categoryid,
    },
    data: {
      isActive: true,
      wasPicked: true,
    },
  });
}

export async function getActiveCategory(bookGroupId: BookGroup["id"]) {
  return prisma.bookCategory.findMany({
    where: {
      bookGroupId,
      isActive: true,
    },
  });
}

export async function createCategory({
  bookGroupId,
  imageId,
  ...category
}: Omit<BookCategory, "wasPicked" | "isActive" | "updatedAt" | "createdAt">) {
  return prisma.bookCategory.create({
    data: {
      bookGroup: { connect: { id: bookGroupId } },
      image: { connect: { id: imageId } },
      ...category,
      wasPicked: false,
      isActive: false,
    },
  });
}

export async function updateCategory({
  imageId,
  id,
  ...category
}: Omit<
  BookCategory,
  "wasPicked" | "isActive" | "updatedAt" | "createdAt" | "bookGroupId"
>) {
  return prisma.bookCategory.update({
    where: {
      id,
    },
    data: {
      image: { connect: { id: imageId } },
      ...category,
    },
  });
}

export async function deleteCategory(id: BookCategory["id"]) {
  return prisma.bookCategory.delete({ where: { id } });
}

export async function unactivateCategory(id: BookCategory["id"]) {
  return prisma.bookCategory.update({
    where: { id },
    data: { isActive: false },
  });
}
