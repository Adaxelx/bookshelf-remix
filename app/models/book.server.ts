import type { Book, BookCategory } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getBook(categoryId: BookCategory["slug"]) {
  return prisma.book.findFirst({
    where: {
      categoryId,
    },
  });
}

export async function createBook(
  bookData: Omit<Book, "updatedAt" | "createdAt">
) {
  return prisma.book.create({
    data: bookData,
  });
}
