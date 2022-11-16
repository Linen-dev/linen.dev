-- DropIndex
DROP INDEX "accounts_slackTeamId_key";

-- AlterTable
ALTER TABLE "auths" ADD COLUMN     "accountId" TEXT;

-- AddForeignKey
ALTER TABLE "auths" ADD CONSTRAINT "auths_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
