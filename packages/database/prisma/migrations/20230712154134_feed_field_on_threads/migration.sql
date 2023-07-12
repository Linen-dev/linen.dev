-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "feed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "threads_feed_idx" ON "threads"("feed");
