-- AlterEnum
ALTER TYPE "MessageFormat" ADD VALUE 'MATRIX';

-- CreateTable
CREATE TABLE "integrationMatrix" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "matrixUrl" TEXT NOT NULL,
    "matrixToken" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "accountsId" TEXT,

    CONSTRAINT "integrationMatrix_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "integrationMatrix" ADD CONSTRAINT "integrationMatrix_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
