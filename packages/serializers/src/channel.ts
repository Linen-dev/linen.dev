import type { channels, users } from '@linen/database';
import { SerializedChannel } from '@linen/types';

export function serializeChannel(
  channel: channels & {
    lastThreadAt?: bigint;
    threadCount?: number;
  }
): SerializedChannel {
  return {
    id: channel.id,
    channelName: channel.channelName,
    hidden: channel.hidden,
    default: channel.default,
    accountId: channel.accountId,
    pages: channel.pages,
    type: channel.type,
    displayOrder: channel.displayOrder || 0,
    viewType: channel.viewType,
  };
}

export const serializeDm =
  (me: string) =>
  (
    dm: channels & {
      memberships: {
        archived: boolean | null;
        user: Pick<users, 'id' | 'displayName'>;
      }[];
    }
  ): channels => {
    const { memberships, ...channel } = dm;
    const user = memberships.find((m) => m.user.id !== me)?.user;
    const hidden = memberships.find((m) => m.user.id === me)?.archived;
    return {
      ...channel,
      channelName: user?.displayName!,
      hidden: hidden || false,
    };
  };
