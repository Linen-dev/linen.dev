-- AlterTable
ALTER TABLE "discordAuthorizations" ADD COLUMN     "customBot" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;
