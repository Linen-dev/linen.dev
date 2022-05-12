-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "discordServerId" TEXT;

-- CreateTable
CREATE TABLE "discordAuthorizations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accountsId" TEXT,

    CONSTRAINT "discordAuthorizations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "discordAuthorizations" ADD CONSTRAINT "discordAuthorizations_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
