/*
  Warnings:

  - You are about to drop the column `slackAuthorizationsId` on the `accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_slackAuthorizationsId_fkey";

-- DropIndex
DROP INDEX "accounts_slackAuthorizationsId_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "slackAuthorizationsId",
ADD COLUMN     "slackUrl" TEXT;

-- AlterTable
ALTER TABLE "slackAuthorizations" ADD COLUMN     "accountsId" TEXT;

-- AddForeignKey
ALTER TABLE "slackAuthorizations" ADD CONSTRAINT "slackAuthorizations_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
