-- CreateTable
CREATE TABLE "apiKeys" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "scope" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "apiKeys_hash_idx" ON "apiKeys"("hash");

-- CreateIndex
CREATE INDEX "apiKeys_accountId_idx" ON "apiKeys"("accountId");

-- AddForeignKey
ALTER TABLE "apiKeys" ADD CONSTRAINT "apiKeys_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
