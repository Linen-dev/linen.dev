/*
  Warnings:

  - A unique constraint covering the columns `[slackAuthorizationsId]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "redirectDomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_slackAuthorizationsId_key" ON "accounts"("slackAuthorizationsId");
