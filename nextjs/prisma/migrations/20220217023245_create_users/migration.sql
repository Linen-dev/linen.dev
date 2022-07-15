-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "usersId" TEXT;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "slackUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profileImageUrl" TEXT NOT NULL,
    "accountsId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_slackUserId_key" ON "users"("slackUserId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
