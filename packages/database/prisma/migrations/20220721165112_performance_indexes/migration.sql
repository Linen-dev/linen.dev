-- CreateIndex
CREATE INDEX "channels_accountId_idx" ON "channels"("accountId");

-- CreateIndex
CREATE INDEX "mentions_messagesId_idx" ON "mentions"("messagesId");

-- CreateIndex
CREATE INDEX "messageAttachments_messagesId_idx" ON "messageAttachments"("messagesId");

-- CreateIndex
CREATE INDEX "messageReactions_messagesId_idx" ON "messageReactions"("messagesId");

-- CreateIndex
CREATE INDEX "threads_channelId_idx" ON "threads"("channelId");
