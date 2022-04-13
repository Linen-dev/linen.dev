-- CreateTable
CREATE TABLE "slackMentions" (
    "messagesId" TEXT NOT NULL,
    "usersId" TEXT NOT NULL,

    CONSTRAINT "slackMentions_pkey" PRIMARY KEY ("messagesId","usersId")
);

-- AddForeignKey
ALTER TABLE "slackMentions" ADD CONSTRAINT "slackMentions_messagesId_fkey" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slackMentions" ADD CONSTRAINT "slackMentions_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
