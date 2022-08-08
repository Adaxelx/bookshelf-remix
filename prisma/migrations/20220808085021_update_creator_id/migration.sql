-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BookGroup" ("createdAt", "creatorId", "id", "name", "updatedAt") SELECT "createdAt", "creatorId", "id", "name", "updatedAt" FROM "BookGroup";
DROP TABLE "BookGroup";
ALTER TABLE "new_BookGroup" RENAME TO "BookGroup";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
