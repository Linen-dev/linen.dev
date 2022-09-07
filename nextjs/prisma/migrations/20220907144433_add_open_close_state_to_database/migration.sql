-- CreateEnum
CREATE TYPE "ThreadState" AS ENUM ('OPEN', 'CLOSE');

-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "state" "ThreadState" NOT NULL DEFAULT E'OPEN';
