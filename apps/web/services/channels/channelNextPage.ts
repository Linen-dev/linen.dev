import { channelNextPageType } from '@linen/types';
import { shouldThisChannelBeAnonymous } from 'services/channels';
import { findThreadsByCursor } from 'services/threads';
import { serializeThread } from '@linen/serializers/thread';
import { decodeCursor } from 'utilities/cursor';
import { sortBySentAtAsc } from '@linen/utilities/object';
import { buildCursor } from 'utilities/buildCursor';
import { AnonymizeType } from '@linen/types';

// aka loadMore, it could be asc (gt) or desc (lt)
// it should return just one cursor, the one to keep loading into same direction
export async function channelNextPage({
  channelId,
  cursor,
}: {
  channelId: string;
  cursor?: string;
}): Promise<channelNextPageType> {
  const { sort, direction, sentAt } = decodeCursor(cursor);
  const { anonymize, anonymizeUsers } = await shouldThisChannelBeAnonymous(
    channelId
  );

  // TODO findTopicsByCursor
  const threads = await findThreadsByCursor({
    channelIds: [channelId],
    sentAt,
    sort,
    direction,
    anonymize: anonymize as AnonymizeType,
    anonymizeUsers,
  }).then((t) => t.sort(sortBySentAtAsc));

  const nextCursor = await buildCursor({
    sort,
    sentAt,
    direction,
    loadMore: true,
    total: threads.length,
    prevDate: threads[0]?.sentAt,
    nextDate: threads[threads.length - 1]?.sentAt,
  });

  return {
    threads: threads.map(serializeThread),
    nextCursor,
  };
}
