/*
  Warnings:

  - Made the column `sentAt` on table `threads` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "threads_channelId_idx";

-- AlterTable
ALTER TABLE "threads" ALTER COLUMN "sentAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "threads_channelId_sentAt_idx" ON "threads"("channelId", "sentAt");
