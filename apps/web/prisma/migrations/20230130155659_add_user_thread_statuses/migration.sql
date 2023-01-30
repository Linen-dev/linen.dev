-- CreateTable
CREATE TABLE "userThreadStatus" (
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "muted" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,

    CONSTRAINT "userThreadStatus_pkey" PRIMARY KEY ("userId","threadId")
);

-- AddForeignKey
ALTER TABLE "userThreadStatus" ADD CONSTRAINT "userThreadStatus_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userThreadStatus" ADD CONSTRAINT "userThreadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
