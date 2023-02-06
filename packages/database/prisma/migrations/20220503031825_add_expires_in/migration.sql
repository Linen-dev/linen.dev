/*
  Warnings:

  - Added the required column `expiresIn` to the `discordAuthorizations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discordAuthorizations" ADD COLUMN     "expiresIn" INTEGER NOT NULL;
