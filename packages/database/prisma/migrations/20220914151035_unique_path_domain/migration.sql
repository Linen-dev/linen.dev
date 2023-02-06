/*
  Warnings:

  - A unique constraint covering the columns `[slackDomain]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "accounts_slackDomain_key" ON "accounts"("slackDomain");
