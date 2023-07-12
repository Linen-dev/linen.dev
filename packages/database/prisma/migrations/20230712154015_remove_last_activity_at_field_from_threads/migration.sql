/*
  Warnings:

  - You are about to drop the column `lastActivityAt` on the `threads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "threads" DROP COLUMN "lastActivityAt";

-- CreateIndex
CREATE INDEX "threads_sentAt_idx" ON "threads"("sentAt");
