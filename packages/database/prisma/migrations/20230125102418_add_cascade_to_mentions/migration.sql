-- DropForeignKey
ALTER TABLE "mentions" DROP CONSTRAINT "mentions_messagesId_fkey";

-- AddForeignKey
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_messagesId_fkey" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
