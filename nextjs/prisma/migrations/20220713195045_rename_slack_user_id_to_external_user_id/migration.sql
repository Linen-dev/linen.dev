-- DropIndex
DROP INDEX "users_slackUserId_accountsId_key";

-- AlterTable
ALTER TABLE "users" RENAME COLUMN "slackUserId" TO "externalUserId";

-- CreateIndex
CREATE UNIQUE INDEX "users_externalUserId_accountsId_key" ON "users"("externalUserId", "accountsId");