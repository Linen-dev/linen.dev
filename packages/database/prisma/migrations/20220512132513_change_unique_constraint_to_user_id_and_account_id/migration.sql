/*
  Warnings:

  - A unique constraint covering the columns `[slackUserId,accountsId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_slackUserId_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_slackUserId_accountsId_key" ON "users"("slackUserId", "accountsId");
