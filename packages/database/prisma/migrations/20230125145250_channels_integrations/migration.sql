-- CreateEnum
CREATE TYPE "channelsIntegrationType" AS ENUM ('GITHUB', 'EMAIL');

-- CreateTable
CREATE TABLE "channelsIntegration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "channelId" TEXT NOT NULL,
    "type" "channelsIntegrationType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "data" JSONB,
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT,

    CONSTRAINT "channelsIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "channelsIntegration_externalId_idx" ON "channelsIntegration"("externalId");

-- AddForeignKey
ALTER TABLE "channelsIntegration" ADD CONSTRAINT "channelsIntegration_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channelsIntegration" ADD CONSTRAINT "channelsIntegration_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channelsIntegration" ADD CONSTRAINT "channelsIntegration_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
