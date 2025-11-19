-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "intro" TEXT,
    "content" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false
);
