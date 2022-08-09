import type { BookCategory, BookGroup } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getCategories(bookGroupId: BookGroup["slug"]) {
  return prisma.bookCategory.findMany({
    where: {
      bookGroupId,
    },
  });
}

export async function getCategory(categorySlug: BookCategory["slug"]) {
  return prisma.bookCategory.findFirst({
    where: {
      slug: categorySlug,
    },
  });
}

export async function setActiveCategory(categorySlug: BookCategory["slug"]) {
  return prisma.bookCategory.update({
    where: {
      slug: categorySlug,
    },
    data: {
      isActive: true,
      wasPicked: true,
    },
  });
}

export async function getActiveCategory(bookGroupId: BookGroup["slug"]) {
  return prisma.bookCategory.findMany({
    where: {
      bookGroupId,
      isActive: true,
    },
  });
}
