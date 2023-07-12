-- DropIndex
DROP INDEX "threads_feed_idx";

-- CreateIndex
CREATE INDEX "threads_feed_lastReplyAt_idx" ON "threads"("feed", "lastReplyAt");
