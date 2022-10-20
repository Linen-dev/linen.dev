-- AlterTable
ALTER TABLE "auths" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "oauthAccounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "refresh_token_expires_in" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "oauthAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauthAccounts_provider_providerAccountId_key" ON "oauthAccounts"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "oauthAccounts" ADD CONSTRAINT "oauthAccounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
