-- CreateTable
CREATE TABLE "slackAuthorizations" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "botUserId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "accountsId" TEXT NOT NULL,

    CONSTRAINT "slackAuthorizations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "slackAuthorizations" ADD CONSTRAINT "slackAuthorizations_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
