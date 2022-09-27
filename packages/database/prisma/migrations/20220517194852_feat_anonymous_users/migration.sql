-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "anonymizeUsers" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "anonymousAlias" TEXT;
