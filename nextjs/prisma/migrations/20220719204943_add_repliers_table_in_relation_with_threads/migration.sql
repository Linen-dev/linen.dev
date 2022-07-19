-- CreateTable
CREATE TABLE "repliers" (
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "repliers_pkey" PRIMARY KEY ("threadId","userId")
);

-- CreateIndex
CREATE INDEX "repliers_threadId_idx" ON "repliers"("threadId");

-- AddForeignKey
ALTER TABLE "repliers" ADD CONSTRAINT "repliers_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repliers" ADD CONSTRAINT "repliers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
