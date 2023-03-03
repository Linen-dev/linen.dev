-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PUBLIC', 'PRIVATE', 'DM');

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "archived" BOOLEAN DEFAULT false,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "type" "ChannelType" DEFAULT E'PUBLIC';

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
