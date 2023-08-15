import { messageAttachments } from '@linen/database';

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
  const promises: any[] = [];

  await Promise.allSettled(promises);
}
