/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "channel" DROP CONSTRAINT "channel_accountId_fkey";

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slackTeamId" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_slackTeamId_key" ON "account"("slackTeamId");

-- AddForeignKey
ALTER TABLE "channel" ADD CONSTRAINT "channel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
