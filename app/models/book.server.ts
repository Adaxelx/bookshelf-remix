import type { BookCategory } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getBook(categoryId: BookCategory["slug"]) {
  return prisma.book.findFirst({
    where: {
      categoryId,
    },
  });
}
