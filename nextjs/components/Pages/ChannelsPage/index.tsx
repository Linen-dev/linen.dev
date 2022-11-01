import type { messages, mentions, users } from '@prisma/client';
import type { Settings } from 'serializers/account/settings';
import ChannelPage from './ChannelPage';
import type { SerializedAttachment, Permissions } from 'types/shared';
import type { SerializedThread } from 'serializers/thread';
import type { ChannelSerialized } from 'lib/channel';
import { SerializedAccount } from 'serializers/account';
import { SerializedReaction } from 'serializers/reaction';

export type ChannelResponse = {
  props?: Props;
  notFound?: boolean;
  redirect?: {
    destination: string;
    permanent: boolean;
  };
};

export interface PaginationType {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

export type messageWithAuthor = messages & {
  author: users | null;
  mentions: (mentions & {
    users: users;
  })[];
  reactions: SerializedReaction[];
  attachments: SerializedAttachment[];
};

interface Props {
  settings: Settings;
  channelName: string;
  channels?: ChannelSerialized[];
  currentChannel: ChannelSerialized;
  currentCommunity: SerializedAccount | null;
  threads: SerializedThread[];
  pinnedThreads: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
  pathCursor: string | null;
  isBot: boolean;
  permissions: Permissions;
}

export default function ChannelView(props: Props) {
  return <ChannelPage {...props} />;
}
