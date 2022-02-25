-- AlterTable
ALTER TABLE "slackAuthorizations" ADD COLUMN     "authedUserId" TEXT,
ADD COLUMN     "userAccessToken" TEXT,
ADD COLUMN     "userScope" TEXT;
