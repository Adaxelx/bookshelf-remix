// Use this to delete specific book category
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-book-category.ts '123'

import { installGlobals } from "@remix-run/node";
import { prisma } from "~/db.server";

installGlobals();

async function deleteBookCategory(slug: string) {
  try {
    await prisma.bookCategory.delete({ where: { slug } });
  } catch (err) {
    console.log(err);
  }
}

deleteBookCategory(process.argv[2]);
