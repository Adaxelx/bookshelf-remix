// Use this to delete specific book group
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-book-group.ts '123'

import { installGlobals } from "@remix-run/node";
import { prisma } from "~/db.server";

installGlobals();

async function deleteBookGroups(id: string) {
  try {
    await prisma.bookGroupsToUsers.deleteMany({
      where: {
        bookGroup: { id },
      },
    });
    await prisma.bookGroup.delete({ where: { id } });
  } catch (err) {
    console.log(err);
  }
}

deleteBookGroups(process.argv[2]);
