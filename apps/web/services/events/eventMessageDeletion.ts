import { prisma, messageAttachments } from '@linen/database';
import { createTypesenseDeletion } from 'queue/jobs';

export async function eventMessageDeletion({
  messageId,
  threadId,
  attachments,
  accountId,
}: {
  messageId: string;
  threadId: string | null;
  attachments: messageAttachments[];
  accountId: string;
}) {
  const promises: Promise<any>[] = [];

  const account = await prisma.accounts.findUnique({
    select: { searchSettings: true },
    where: { id: accountId },
  });

  if (!!account?.searchSettings && threadId) {
    promises.push(
      createTypesenseDeletion({
        threadId,
        accountId,
      })
    );
  }

  // TODO: handle attachments clean up

  await Promise.allSettled(promises);
}
