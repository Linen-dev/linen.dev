-- CreateEnum
CREATE TYPE "AnonymizeType" AS ENUM ('NONE', 'MEMBERS', 'ALL');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "anonymize" "AnonymizeType" NOT NULL DEFAULT E'NONE';
