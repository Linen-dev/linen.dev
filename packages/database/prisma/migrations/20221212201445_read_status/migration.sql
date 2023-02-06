-- CreateTable
CREATE TABLE "readStatus" (
    "authId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lastReadAt" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readStatus_pkey" PRIMARY KEY ("authId","channelId")
);

-- AddForeignKey
ALTER TABLE "readStatus" ADD CONSTRAINT "readStatus_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readStatus" ADD CONSTRAINT "readStatus_authId_fkey" FOREIGN KEY ("authId") REFERENCES "auths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
