-- AlterTable
ALTER TABLE "mentions" RENAME CONSTRAINT "slackMentions_pkey" TO "mentions_pkey";

-- RenameForeignKey
ALTER TABLE "mentions" RENAME CONSTRAINT "slackMentions_messagesId_fkey" TO "mentions_messagesId_fkey";

-- RenameForeignKey
ALTER TABLE "mentions" RENAME CONSTRAINT "slackMentions_usersId_fkey" TO "mentions_usersId_fkey";
