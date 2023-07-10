-- CreateTable
CREATE TABLE "accountTag" (
    "accountId" TEXT NOT NULL,
    "tag" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accountTag_accountId_tag_key" ON "accountTag"("accountId", "tag");

-- AddForeignKey
ALTER TABLE "accountTag" ADD CONSTRAINT "accountTag_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
