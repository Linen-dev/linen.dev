/*
  Warnings:

  - A unique constraint covering the columns `[incrementId]` on the table `slackThreads` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "slackThreads_incrementId_key" ON "slackThreads"("incrementId");
