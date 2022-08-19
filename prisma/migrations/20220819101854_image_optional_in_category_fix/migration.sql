/*
  Warnings:

  - Made the column `imageId` on table `BookCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bookGroupId` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
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
    CONSTRAINT "BookCategory_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookCategory_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookCategory" ("bookGroupId", "createdAt", "imageId", "isActive", "name", "slug", "updatedAt", "wasPicked") SELECT "bookGroupId", "createdAt", "imageId", "isActive", "name", "slug", "updatedAt", "wasPicked" FROM "BookCategory";
DROP TABLE "BookCategory";
ALTER TABLE "new_BookCategory" RENAME TO "BookCategory";
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encoded" TEXT NOT NULL,
    "bookGroupId" TEXT NOT NULL,
    CONSTRAINT "Image_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("bookGroupId", "encoded", "id") SELECT "bookGroupId", "encoded", "id" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
