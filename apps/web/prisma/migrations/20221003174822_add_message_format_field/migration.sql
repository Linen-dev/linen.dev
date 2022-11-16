-- CreateEnum
CREATE TYPE "MessageFormat" AS ENUM ('DISCORD', 'SLACK', 'LINEN');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "messageFormat" "MessageFormat";
