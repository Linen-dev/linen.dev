-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_slackThreadId_fkey";

-- AlterTable
ALTER TABLE "messages" RENAME COLUMN "slackThreadId" TO "threadId";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
