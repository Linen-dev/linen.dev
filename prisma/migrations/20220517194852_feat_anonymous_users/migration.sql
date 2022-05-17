-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "anonimyzeUsers" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "anonymousAlias" TEXT;
