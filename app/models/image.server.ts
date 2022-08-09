import type { Image } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getImage(imageId: Image["id"]) {
  return prisma.image.findFirst({
    where: { id: imageId },
  });
}
