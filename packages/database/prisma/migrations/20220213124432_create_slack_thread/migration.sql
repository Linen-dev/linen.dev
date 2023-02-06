/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
ADD COLUMN     "slackThreadId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Message_id_seq";

-- CreateTable
CREATE TABLE "SlackThread" (
    "id" TEXT NOT NULL,
    "slackThreadTs" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "SlackThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackThread_slackThreadTs_key" ON "SlackThread"("slackThreadTs");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_slackThreadId_fkey" FOREIGN KEY ("slackThreadId") REFERENCES "SlackThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackThread" ADD CONSTRAINT "SlackThread_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
