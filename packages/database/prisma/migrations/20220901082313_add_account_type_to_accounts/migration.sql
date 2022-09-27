-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "type" "AccountType" NOT NULL DEFAULT E'PUBLIC';
