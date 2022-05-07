/*
  Warnings:

  - A unique constraint covering the columns `[channelId,slackMessageId]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slackMessageId` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "messages_body_sentAt_key";

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "slackMessageId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "messages_channelId_slackMessageId_key" ON "messages"("channelId", "slackMessageId");
