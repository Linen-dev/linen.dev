-- CreateTable
CREATE TABLE "messageAttachments" (
    "messagesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT,
    "mimetype" TEXT,
    "internalUrl" TEXT,
    "permalink" TEXT,

    CONSTRAINT "messageAttachments_pkey" PRIMARY KEY ("messagesId","externalId")
);

-- CreateTable
CREATE TABLE "messageReactions" (
    "messagesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER,
    "users" JSONB,

    CONSTRAINT "messageReactions_pkey" PRIMARY KEY ("messagesId","name")
);

-- AddForeignKey
ALTER TABLE "messageAttachments" ADD CONSTRAINT "messageAttachments_messagesId_fkey" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messageReactions" ADD CONSTRAINT "messageReactions_messagesId_fkey" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
