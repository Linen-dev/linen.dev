import { SerializedThread } from '@linen/types';
import { shouldThisChannelBeAnonymous } from 'lib/channel';
import { findThreadsByCursor } from 'lib/threads';
import serializeThread from 'serializers/thread';

export async function channelNextPage({
  channelId,
  page,
}: {
  channelId: string;
  page: number | null;
}): Promise<SerializedThread[]> {
  const anonymizeUsers = await shouldThisChannelBeAnonymous(channelId);
  const threads = await findThreadsByCursor({
    channelIds: [channelId],
    anonymizeUsers,
    page,
  });

  return threads.map(serializeThread);
}
