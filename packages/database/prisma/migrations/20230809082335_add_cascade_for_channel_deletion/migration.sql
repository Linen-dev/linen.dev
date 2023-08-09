-- DropForeignKey
ALTER TABLE "channelsIntegration" DROP CONSTRAINT "channelsIntegration_channelId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_channelId_fkey";

-- DropForeignKey
ALTER TABLE "threads" DROP CONSTRAINT "threads_channelId_fkey";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channelsIntegration" ADD CONSTRAINT "channelsIntegration_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
