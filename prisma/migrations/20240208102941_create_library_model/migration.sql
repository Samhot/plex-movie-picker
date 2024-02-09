-- CreateEnum
CREATE TYPE "LibraryType" AS ENUM ('MOVIE', 'TV_SHOW');

-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LibraryType" NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LibraryToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Library_uuid_key" ON "Library"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "_LibraryToMovie_AB_unique" ON "_LibraryToMovie"("A", "B");

-- CreateIndex
CREATE INDEX "_LibraryToMovie_B_index" ON "_LibraryToMovie"("B");

-- AddForeignKey
ALTER TABLE "_LibraryToMovie" ADD CONSTRAINT "_LibraryToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryToMovie" ADD CONSTRAINT "_LibraryToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
