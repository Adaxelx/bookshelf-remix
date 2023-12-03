import type { BookGroup, Image } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getImage(imageId: Image["id"]) {
  return prisma.image.findFirst({
    where: { id: imageId },
  });
}

export async function getImages(bookGroupId: BookGroup["id"]) {
  return prisma.image.findMany({
    where: { OR: [{ bookGroupId: null }, { bookGroupId }] },
    select: { id: true, altText: true },
  });
}

export async function createImage(imageData: Omit<Image, "id">) {
  return prisma.image.create({
    data: imageData,
  });
}

export async function deleteImage(imageId: Image["id"]) {
  return prisma.image.delete({
    where: {
      id: imageId,
    },
  });
}
