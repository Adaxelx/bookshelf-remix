/*
  Warnings:

  - Added the required column `imageId` to the `BookCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encoded" BLOB NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookCategory" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "bookGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "wasPicked" BOOLEAN NOT NULL DEFAULT false,
    "imageId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookCategory_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookCategory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookCategory" ("bookGroupId", "createdAt", "isActive", "name", "slug", "updatedAt", "wasPicked") SELECT "bookGroupId", "createdAt", "isActive", "name", "slug", "updatedAt", "wasPicked" FROM "BookCategory";
DROP TABLE "BookCategory";
ALTER TABLE "new_BookCategory" RENAME TO "BookCategory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
