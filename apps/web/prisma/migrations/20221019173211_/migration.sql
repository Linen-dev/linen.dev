/*
  Warnings:

  - You are about to drop the column `messagesViewType` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the `featureFlags` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountIntegration" AS ENUM ('NONE', 'SLACK', 'DISCORD');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('NONE', 'MANAGERS', 'MEMBERS');

-- DropForeignKey
ALTER TABLE "featureFlags" DROP CONSTRAINT "featureFlags_accountId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "messagesViewType",
ADD COLUMN     "chat" "ChatType" NOT NULL DEFAULT E'NONE',
ADD COLUMN     "integration" "AccountIntegration" NOT NULL DEFAULT E'NONE';

-- DropTable
DROP TABLE "featureFlags";

-- DropEnum
DROP TYPE "MessagesViewType";
