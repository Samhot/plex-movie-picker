/*
  Warnings:

  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionParticipation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Swipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MatchToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SessionParticipationToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_movieId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Swipe" DROP CONSTRAINT "Swipe_movieId_fkey";

-- DropForeignKey
ALTER TABLE "Swipe" DROP CONSTRAINT "Swipe_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Swipe" DROP CONSTRAINT "Swipe_userId_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_SessionParticipationToUser" DROP CONSTRAINT "_SessionParticipationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SessionParticipationToUser" DROP CONSTRAINT "_SessionParticipationToUser_B_fkey";

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "SessionParticipation";

-- DropTable
DROP TABLE "Swipe";

-- DropTable
DROP TABLE "_MatchToUser";

-- DropTable
DROP TABLE "_SessionParticipationToUser";

-- CreateTable
CREATE TABLE "game_session" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "movieIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_action" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GameParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "game_session_code_key" ON "game_session"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_GameParticipants_AB_unique" ON "_GameParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_GameParticipants_B_index" ON "_GameParticipants"("B");

-- AddForeignKey
ALTER TABLE "game_session" ADD CONSTRAINT "game_session_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_action" ADD CONSTRAINT "game_action_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_action" ADD CONSTRAINT "game_action_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameParticipants" ADD CONSTRAINT "_GameParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "game_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameParticipants" ADD CONSTRAINT "_GameParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
