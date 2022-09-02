/*
  Warnings:

  - You are about to drop the column `type` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "type";

-- DropEnum
DROP TYPE "AccountType";
