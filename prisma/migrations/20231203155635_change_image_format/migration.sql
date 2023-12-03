/*
  Warnings:

  - You are about to drop the column `encoded` on the `Image` table. All the data in the column will be lost.
  - Added the required column `altText` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blob` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentType` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookGroupId" TEXT,
    "blob" BLOB NOT NULL,
    "altText" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    CONSTRAINT "Image_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("bookGroupId", "id") SELECT "bookGroupId", "id" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE INDEX "Image_bookGroupId_idx" ON "Image"("bookGroupId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
