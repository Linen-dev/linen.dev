/*
  Warnings:

  - You are about to drop the column `createdAt` on the `channels` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `slackThreads` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channels" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "slackThreads" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt";
