// Use this to create a new book group
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-book-group.ts "userId" "group name" "id"

import { installGlobals } from "@remix-run/node";

import { createBookGroup } from "~/models/bookGroup.server";

installGlobals();

async function createGroup(userId: string, name: string, id: string) {
  if (!userId) {
    throw new Error("user id is required for creating a book group");
  }
  if (!name) {
    throw new Error("name is required");
  }

  if (!id) {
    throw new Error("id is required");
  }
  try {
    await createBookGroup({ name, id, creatorId: userId });
  } catch (err) {
    console.log(err);
  }
}

createGroup(process.argv[2], process.argv[3], process.argv[4]);
