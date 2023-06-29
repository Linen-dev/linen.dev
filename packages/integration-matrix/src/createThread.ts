import type LinenSdk from '@linen/sdk';
import { MessageFormat } from '@linen/types';

export async function createThread({
  accountId,
  channelName,
  externalChannelId,
  userDisplayName,
  externalUserId,
  externalThreadId,
  body,
  linenSdk,
}: {
  accountId: string;
  channelName: string;
  externalChannelId: string;
  userDisplayName: string;
  externalUserId: string;
  body: string;
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
  await linenSdk.createNewThread({
    accountId,
    authorId: user.id,
    body,
    channelId: channel.id,
    externalThreadId,
    messageFormat: MessageFormat.MATRIX,
  });
}
