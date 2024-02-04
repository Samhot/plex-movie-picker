-- CreateEnum
CREATE TYPE "MediaCenter" AS ENUM ('PLEX');

-- CreateTable
CREATE TABLE "ClientSecret" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "mediacenter" "MediaCenter" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plexUrl" TEXT NOT NULL,
    "plexToken" TEXT NOT NULL,
    "movieSectionId" INTEGER NOT NULL,

    CONSTRAINT "ClientSecret_pkey" PRIMARY KEY ("id")
);
