-- AlterTable
ALTER TABLE "threads" RENAME CONSTRAINT "slackThreads_pkey" TO "threads_pkey";

-- RenameForeignKey
ALTER TABLE "threads" RENAME CONSTRAINT "slackThreads_channelId_fkey" TO "threads_channelId_fkey";

-- RenameIndex
ALTER INDEX "slackThreads_incrementId_key" RENAME TO "threads_incrementId_key";

-- RenameIndex
ALTER INDEX "slackThreads_slackThreadTs_key" RENAME TO "threads_slackThreadTs_key";
