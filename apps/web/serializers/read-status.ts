import { SerializedReadStatus } from '@linen/types';

function isChannelRead(
  lastReadAt: BigInt,
  lastReplyAt: BigInt | null
): boolean {
  if (!lastReplyAt) {
    return true;
  }
  return lastReadAt >= lastReplyAt;
}

function serialize(status: any): SerializedReadStatus {
  const thread = status.channel.threads[0];
  const lastReadAt = status.lastReadAt;
  const lastReplyAt = thread?.sentAt;
  return {
    channelId: status.channelId,
    lastReadAt: lastReadAt.toString(),
    lastReplyAt: lastReplyAt ? lastReplyAt.toString() : null,
    read: isChannelRead(lastReadAt, lastReplyAt),
  };
}

export default serialize;
