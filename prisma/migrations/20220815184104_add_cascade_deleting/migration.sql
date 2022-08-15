-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookGroupsToUsers" (
    "bookGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "bookGroupId"),
    CONSTRAINT "BookGroupsToUsers_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookGroupsToUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BookGroupsToUsers" ("bookGroupId", "userId") SELECT "bookGroupId", "userId" FROM "BookGroupsToUsers";
DROP TABLE "BookGroupsToUsers";
ALTER TABLE "new_BookGroupsToUsers" RENAME TO "BookGroupsToUsers";
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
CREATE TABLE "new_Opinion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opinion_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Opinion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Opinion" ("bookId", "createdAt", "description", "id", "rate", "updatedAt", "userId") SELECT "bookId", "createdAt", "description", "id", "rate", "updatedAt", "userId" FROM "Opinion";
DROP TABLE "Opinion";
ALTER TABLE "new_Opinion" RENAME TO "Opinion";
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "encoded" TEXT NOT NULL,
    "bookGroupId" TEXT,
    CONSTRAINT "Image_bookGroupId_fkey" FOREIGN KEY ("bookGroupId") REFERENCES "BookGroup" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("bookGroupId", "encoded", "id") SELECT "bookGroupId", "encoded", "id" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_Book" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "dateStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEnd" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BookCategory" ("slug") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "categoryId", "createdAt", "dateEnd", "dateStart", "slug", "title", "updatedAt") SELECT "author", "categoryId", "createdAt", "dateEnd", "dateStart", "slug", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_categoryId_key" ON "Book"("categoryId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
