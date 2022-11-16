-- CreateEnum
CREATE TYPE "MessagesViewType" AS ENUM ('THREADS', 'THREADS_WITH_MESSAGES', 'MESSAGES');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "messagesViewType" "MessagesViewType" NOT NULL DEFAULT E'THREADS';
