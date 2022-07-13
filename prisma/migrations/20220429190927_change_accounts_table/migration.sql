-- AlterTable
ALTER TABLE "accounts"
    ADD COLUMN "slackSyncStatus" TEXT NOT NULL DEFAULT 'DONE',
    ALTER COLUMN "slackSyncStatus" SET DEFAULT 'NOT_STARTED';
