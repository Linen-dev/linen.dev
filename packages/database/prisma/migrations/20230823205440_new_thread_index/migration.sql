/*
  Warnings:

  - A unique constraint covering the columns `[channelId,externalThreadId]` on the table `threads` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "threads_channelId_externalThreadId_key" ON "threads"("channelId", "externalThreadId");
