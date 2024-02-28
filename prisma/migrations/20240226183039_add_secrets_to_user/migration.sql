/*
  Warnings:

  - Added the required column `userId` to the `ClientSecret` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientSecretId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientSecret" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clientSecretId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientSecretId_fkey" FOREIGN KEY ("clientSecretId") REFERENCES "ClientSecret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
