import type LinenSdk from '@linen/sdk';
import { MessageFormat } from '@linen/types';

export async function createMessage({
  accountId,
  channelName,
  externalChannelId,
  userDisplayName,
  externalUserId,
  externalMessageId,
  body,
  externalThreadId,
  linenSdk,
}: {
  accountId: string;
  channelName: string;
  externalChannelId: string;
  userDisplayName: string;
  externalUserId: string;
  body: string;
  externalMessageId: string;
  externalThreadId: string;
  linenSdk: LinenSdk;
}) {
  const channel = await linenSdk.findOrCreateChannel({
    accountId,
    channelName,
    externalChannelId,
  });
  const user = await linenSdk.findOrCreateUser({
    accountsId: accountId,
    displayName: userDisplayName,
    externalUserId,
  });
  const thread = await linenSdk.getThread({ externalThreadId });
  if (thread?.id) {
    await linenSdk.createNewMessage({
      accountId,
      authorId: user.id,
      body,
      channelId: channel.id,
      externalMessageId,
      threadId: thread.id,
      messageFormat: MessageFormat.MATRIX,
    });
  }
}
