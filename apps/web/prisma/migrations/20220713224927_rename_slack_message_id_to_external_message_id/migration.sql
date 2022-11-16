-- DropIndex
DROP INDEX "messages_channelId_slackMessageId_key";

-- AlterTable
ALTER TABLE "messages" RENAME COLUMN "slackMessageId" TO "externalMessageId";

-- CreateIndex
CREATE UNIQUE INDEX "messages_channelId_externalMessageId_key" ON "messages"("channelId", "externalMessageId");
