-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_slackThreadId_fkey";

-- RenameTable
ALTER TABLE "slackThreads" RENAME TO "threads";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_slackThreadId_fkey" FOREIGN KEY ("slackThreadId") REFERENCES "threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
