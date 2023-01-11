import type { channels } from '@prisma/client';
import { SerializedChannel } from '@linen/types';

export default function serializeChannel(
  channel?: channels
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
  };
}
