-- AlterTable
ALTER TABLE "threads" ADD COLUMN     "closeAt" BIGINT,
ADD COLUMN     "firstManagerReplyAt" BIGINT,
ADD COLUMN     "firstUserReplyAt" BIGINT;
