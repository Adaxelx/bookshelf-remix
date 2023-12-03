import type { Book, BookCategory } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getBookByCategoryId(categoryId: BookCategory["id"]) {
  return prisma.book.findFirst({
    where: {
      categoryId,
    },
  });
}

export async function deleteBook(categoryId: BookCategory["id"]) {
  return prisma.book.delete({
    where: {
      categoryId,
    },
  });
}

export async function getBookById(id: Book["id"]) {
  return prisma.book.findFirst({
    where: {
      id,
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

export async function updateBook(
  bookData: Omit<Book, "updatedAt" | "createdAt">
) {
  return prisma.book.update({
    where: {
      categoryId: bookData.categoryId,
    },
    data: bookData,
  });
}
