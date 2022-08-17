import type { Book, BookCategory } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getBookByCategoryId(categoryId: BookCategory["slug"]) {
  return prisma.book.findFirst({
    where: {
      categoryId,
    },
  });
}

export async function deleteBook(categoryId: BookCategory["slug"]) {
  return prisma.book.delete({
    where: {
      categoryId,
    },
  });
}

export async function getBookBySlug(slug: Book["slug"]) {
  return prisma.book.findFirst({
    where: {
      slug,
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
