/*
  Warnings:

  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SlackThread` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_slackThreadId_fkey";

-- DropForeignKey
ALTER TABLE "SlackThread" DROP CONSTRAINT "SlackThread_channelId_fkey";

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "SlackThread";

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "channelId" TEXT NOT NULL,
    "slackThreadId" TEXT,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slackThread" (
    "id" TEXT NOT NULL,
    "slackThreadTs" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "slackThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "slackChannelId" TEXT NOT NULL,
    "accountId" TEXT,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_body_sentAt_key" ON "message"("body", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "slackThread_slackThreadTs_key" ON "slackThread"("slackThreadTs");

-- CreateIndex
CREATE UNIQUE INDEX "channel_slackChannelId_key" ON "channel"("slackChannelId");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_slackThreadId_fkey" FOREIGN KEY ("slackThreadId") REFERENCES "slackThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slackThread" ADD CONSTRAINT "slackThread_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel" ADD CONSTRAINT "channel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
