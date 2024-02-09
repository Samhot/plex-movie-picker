/*
  Warnings:

  - Added the required column `userId` to the `Library` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Library" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
