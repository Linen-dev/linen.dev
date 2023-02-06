-- CreateTable
CREATE TABLE "featureFlags" (
    "accountId" TEXT NOT NULL,
    "isFeedEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isChatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isCreateChannelEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "featureFlags_pkey" PRIMARY KEY ("accountId")
);

-- AddForeignKey
ALTER TABLE "featureFlags" ADD CONSTRAINT "featureFlags_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
