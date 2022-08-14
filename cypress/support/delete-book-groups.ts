// Use this to delete all book groups
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-book-groups.ts

import { installGlobals } from "@remix-run/node";
import { prisma } from "~/db.server";

installGlobals();

async function deleteBookGroups() {
  try {
    await prisma.bookGroup.deleteMany({});
  } catch (err) {
    console.log(err);
  }
}

deleteBookGroups();
