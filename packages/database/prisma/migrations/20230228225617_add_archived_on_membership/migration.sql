/*
  Warnings:

  - Made the column `archived` on table `channels` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "channels" ALTER COLUMN "archived" SET NOT NULL;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "archived" BOOLEAN;
