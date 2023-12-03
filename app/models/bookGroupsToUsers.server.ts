import type { BookGroup } from "@prisma/client";
import type { User } from "./user.server";
import { getUserByEmail } from "./user.server";
import { prisma } from "~/db.server";

export async function addUserToBookGroup({
  email,
  id,
}: {
  email: User["email"];
  id: BookGroup["id"];
}) {
  const user = await getUserByEmail(email);

  if (!user) return `User with email ${email} doesn't exist.`;

  const connection = await prisma.bookGroupsToUsers.findFirst({
    where: {
      userId: user.id,
      bookGroupId: id,
    },
  });

  if (connection) return `User with email ${email} is already in group ${id}.`;

  return prisma.bookGroupsToUsers.create({
    data: {
      userId: user.id,
      bookGroupId: id,
    },
  });
}

export async function getUsersForBookGroup(id: BookGroup["id"]) {
  return prisma.bookGroupsToUsers.findMany({
    where: { bookGroupId: id },
    include: {
      user: { select: { email: true } },
      bookGroup: { select: { creatorId: true } },
    },
  });
}

export async function removeUserFromGroup({
  id,
  userId,
}: {
  id: BookGroup["id"];
  userId: User["id"];
}) {
  return prisma.bookGroupsToUsers.deleteMany({
    where: {
      userId: userId,
      bookGroupId: id,
    },
  });
}
