-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "EmbeddingsType" AS ENUM ('QUESTION', 'ANSWER', 'SUMMARY');

-- CreateTable
CREATE TABLE "embeddings" (
    "accountId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "type" "EmbeddingsType" NOT NULL,
    "value" TEXT NOT NULL,
    "embedding" vector(1536),

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("threadId","type")
);

-- CreateIndex
CREATE INDEX "embeddings_accountId_idx" ON "embeddings"("accountId");

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
