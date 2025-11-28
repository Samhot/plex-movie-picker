/*
  Warnings:

  - You are about to drop the column `clientSecretId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ClientSecret` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaCenter" ADD VALUE 'JELLYFIN';
ALTER TYPE "MediaCenter" ADD VALUE 'EMBY';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clientSecretId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clientSecretId";

-- DropTable
DROP TABLE "ClientSecret";

-- CreateTable
CREATE TABLE "MediaSource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MediaCenter" NOT NULL,
    "url" TEXT NOT NULL,
    "credentials" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaSource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MediaSource" ADD CONSTRAINT "MediaSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
