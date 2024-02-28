/*
  Warnings:

  - You are about to drop the column `uuid` on the `Library` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guid]` on the table `Library` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guid` to the `Library` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Library_uuid_key";

-- AlterTable
ALTER TABLE "ClientSecret" ALTER COLUMN "movieSectionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Library" DROP COLUMN "uuid",
ADD COLUMN     "guid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Library_guid_key" ON "Library"("guid");
