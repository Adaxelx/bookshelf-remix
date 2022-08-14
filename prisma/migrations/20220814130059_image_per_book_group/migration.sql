-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encoded" TEXT NOT NULL,
    "bookGroupId" TEXT,
    CONSTRAINT "Image_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("encoded", "id") SELECT "encoded", "id" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
