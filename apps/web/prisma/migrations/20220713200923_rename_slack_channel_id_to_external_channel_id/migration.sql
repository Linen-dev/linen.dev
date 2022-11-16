-- DropIndex
DROP INDEX "channels_slackChannelId_key";

-- AlterTable
ALTER TABLE "channels" RENAME COLUMN "slackChannelId" TO "externalChannelId";

-- CreateIndex
CREATE UNIQUE INDEX "channels_externalChannelId_key" ON "channels"("externalChannelId");
