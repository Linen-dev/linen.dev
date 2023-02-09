import type { channels } from '@linen/database';
import { SerializedChannel } from '@linen/types';
import { formatDistance } from '@linen/utilities/date';

export default function serializeChannel(
  channel?: channels & {
    lastThreadAt?: bigint;
    threadCount?: number;
  }
): SerializedChannel | null {
  if (!channel) {
    return null;
  }
  return {
    id: channel.id,
    channelName: channel.channelName,
    hidden: channel.hidden,
    default: channel.default,
    accountId: channel.accountId,
    pages: channel.pages,
    ...stats(channel),
  };
}

function stats({
  lastThreadAt,
  threadCount,
}: {
  lastThreadAt?: bigint;
  threadCount?: number;
}) {
  if (!threadCount) {
    return {};
  }

  let stats = `${threadCount} thread${threadCount > 1 ? 's' : ''}`;
  if (lastThreadAt) {
    const date = new Date(Math.floor(Number(lastThreadAt))).toISOString();
    stats += `, latest from ${formatDistance(date)}`;
  }
  return { stats };
}
