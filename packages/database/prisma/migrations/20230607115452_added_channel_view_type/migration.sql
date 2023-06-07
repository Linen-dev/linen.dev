-- CreateEnum
CREATE TYPE "ChannelViewType" AS ENUM ('CHAT', 'FORUM');

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "viewType" "ChannelViewType" NOT NULL DEFAULT E'CHAT';
