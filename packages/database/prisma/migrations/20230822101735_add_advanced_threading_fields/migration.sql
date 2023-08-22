-- CreateEnum
CREATE TYPE "ChannelOrderBy" AS ENUM ('THREAD_SENT_AT', 'THREAD_LAST_REPLY_AT');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "featurePreview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "orderBy" "ChannelOrderBy" NOT NULL DEFAULT E'THREAD_SENT_AT';
