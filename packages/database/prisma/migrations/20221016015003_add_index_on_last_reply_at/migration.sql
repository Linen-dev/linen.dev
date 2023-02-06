-- CreateIndex
CREATE INDEX "threads_channelId_hidden_state_lastReplyAt_idx" ON "threads"("channelId", "hidden", "state", "lastReplyAt");
