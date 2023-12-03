// Use this to create a new book group
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-book-group.ts "userId" "group name" "id"

import { installGlobals } from "@remix-run/node";

import { createImage } from "~/models/image.server";
import { createCategory } from "~/models/bookCategory.server";
installGlobals();
const fs = require("fs");
const path = require("node:path");

function base64_encode(file: string) {
  // read binary data
  var bitmap = fs.readFileSync(path.resolve(__dirname, file));
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString("base64");
}

async function createCategoryWithImage(
  bookGroupId: string,
  name: string,
  id: string
) {
  if (!bookGroupId) {
    throw new Error("bookGroup id is required for creating a book category");
  }
  if (!name) {
    throw new Error("name is required");
  }

  if (!id) {
    throw new Error("id is required");
  }
  try {
    const image = await createImage({
      bookGroupId,
      blob: null,
    });
    const category = await createCategory({
      name,
      id,
      bookGroupId,
      imageId: image.id,
    });
    console.log(
      `
  <imageId>
      ${image.id}
  </imageId>
    `.trim()
    );
  } catch (err) {
    console.log(err);
  }
}

createCategoryWithImage(process.argv[2], process.argv[3], process.argv[4]);
