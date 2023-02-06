/*
  Warnings:

  - You are about to drop the column `expiresIn` on the `discordAuthorizations` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `discordAuthorizations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discordAuthorizations" DROP COLUMN "expiresIn",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
