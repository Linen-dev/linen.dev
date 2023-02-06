-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authsId" TEXT,
ALTER COLUMN "externalUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "memberships" (
    "usersId" TEXT NOT NULL,
    "channelsId" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "memberships_usersId_idx" ON "memberships"("usersId");

-- CreateIndex
CREATE INDEX "memberships_channelsId_idx" ON "memberships"("channelsId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_usersId_channelsId_key" ON "memberships"("usersId", "channelsId");

-- CreateIndex
CREATE INDEX "users_authsId_idx" ON "users"("authsId");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_channelsId_fkey" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_authsId_fkey" FOREIGN KEY ("authsId") REFERENCES "auths"("id") ON DELETE SET NULL ON UPDATE CASCADE;
