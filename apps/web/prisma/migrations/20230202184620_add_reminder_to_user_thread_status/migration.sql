-- AlterTable
ALTER TABLE "userThreadStatus" ADD COLUMN     "remindAt" TIMESTAMP(3),
ADD COLUMN     "reminder" BOOLEAN NOT NULL DEFAULT false;
