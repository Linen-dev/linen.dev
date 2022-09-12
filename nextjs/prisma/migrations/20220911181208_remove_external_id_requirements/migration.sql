-- AlterTable
ALTER TABLE "channels" ALTER COLUMN "externalChannelId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "threads" ALTER COLUMN "externalThreadId" DROP NOT NULL;
