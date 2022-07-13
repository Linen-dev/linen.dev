/*
  Warnings:

  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slackThread` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "channel" DROP CONSTRAINT "channel_accountId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_channelId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_slackThreadId_fkey";

-- DropForeignKey
ALTER TABLE "slackThread" DROP CONSTRAINT "slackThread_channelId_fkey";

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "channel";

-- DropTable
DROP TABLE "message";

-- DropTable
DROP TABLE "slackThread";

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "channelId" TEXT NOT NULL,
    "slackThreadId" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slackThreads" (
    "id" TEXT NOT NULL,
    "slackThreadTs" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "slackThreads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "slackChannelId" TEXT NOT NULL,
    "accountId" TEXT,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slackTeamId" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_body_sentAt_key" ON "messages"("body", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "slackThreads_slackThreadTs_key" ON "slackThreads"("slackThreadTs");

-- CreateIndex
CREATE UNIQUE INDEX "channels_slackChannelId_key" ON "channels"("slackChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_slackTeamId_key" ON "accounts"("slackTeamId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_slackThreadId_fkey" FOREIGN KEY ("slackThreadId") REFERENCES "slackThreads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slackThreads" ADD CONSTRAINT "slackThreads_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
