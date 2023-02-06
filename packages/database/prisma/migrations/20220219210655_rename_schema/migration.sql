/*
  Warnings:

  - You are about to drop the column `accountsId` on the `slackAuthorizations` table. All the data in the column will be lost.
  - Added the required column `slackAuthorizationsId` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "slackAuthorizations" DROP CONSTRAINT "slackAuthorizations_accountsId_fkey";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "slackAuthorizationsId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "slackAuthorizations" DROP COLUMN "accountsId";

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_slackAuthorizationsId_fkey" FOREIGN KEY ("slackAuthorizationsId") REFERENCES "slackAuthorizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
