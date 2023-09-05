-- CreateIndex
CREATE INDEX "messages_channelId_sentAt_idx" ON "messages"("channelId", "sentAt" DESC);
