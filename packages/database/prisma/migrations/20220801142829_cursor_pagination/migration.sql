-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "sentAt" BIGINT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "threads_channelId_sentAt_idx" ON "threads"("channelId", "sentAt");
