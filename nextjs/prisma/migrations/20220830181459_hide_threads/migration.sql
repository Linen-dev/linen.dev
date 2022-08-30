-- DropIndex
DROP INDEX "threads_channelId_sentAt_idx";

-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "threads_channelId_sentAt_hidden_idx" ON "threads"("channelId", "sentAt", "hidden");
