import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserBookGroups(id: User["id"]) {
  return prisma.bookGroup.findMany({
    where: {
      users: { some: { userId: id } },
    },
  });
}
