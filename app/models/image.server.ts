import type { BookGroup, Image } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getImage(imageId: Image["id"]) {
  return prisma.image.findFirst({
    where: { id: imageId },
  });
}

export async function getImages(bookGroupId: BookGroup["slug"]) {
  return prisma.image.findMany({
    where: { OR: [{ bookGroupId: null }, { bookGroupId }] },
  });
}
