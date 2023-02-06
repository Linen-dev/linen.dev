-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "lastPageBuildAt" BIGINT,
ADD COLUMN     "pages" INTEGER;

-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "page" INTEGER;

-- CreateIndex
CREATE INDEX "threads_channelId_page_idx" ON "threads"("channelId", "page");
