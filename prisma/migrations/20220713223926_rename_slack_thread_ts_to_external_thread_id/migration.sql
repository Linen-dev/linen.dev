-- DropIndex
DROP INDEX "threads_slackThreadTs_key";

-- AlterTable
ALTER TABLE "threads" RENAME COLUMN "slackThreadTs" TO "externalThreadId";

-- CreateIndex
CREATE UNIQUE INDEX "threads_externalThreadId_key" ON "threads"("externalThreadId");
