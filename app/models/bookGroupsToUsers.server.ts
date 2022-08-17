import type { BookGroup } from "@prisma/client";
import type { User } from "./user.server";
import { getUserByEmail } from "./user.server";
import { prisma } from "~/db.server";

export async function addUserToBookGroup({
  email,
  slug,
}: {
  email: User["email"];
  slug: BookGroup["slug"];
}) {
  const user = await getUserByEmail(email);

  if (!user) return `User with email ${email} doesn't exist.`;

  const connection = await prisma.bookGroupsToUsers.findFirst({
    where: {
      userId: user.id,
      bookGroupId: slug,
    },
  });

  if (connection)
    return `User with email ${email} is already in group ${slug}.`;

  return prisma.bookGroupsToUsers.create({
    data: {
      userId: user.id,
      bookGroupId: slug,
    },
  });
}
