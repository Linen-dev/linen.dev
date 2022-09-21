import { channels, messages, mentions, users } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import ChannelPage from './ChannelPage';
import {
  SerializedAttachment,
  SerializedReaction,
  Permissions,
} from 'types/shared';
import { SerializedThread } from 'serializers/thread';

export type ChannelResponse = {
  props?: ChannelViewProps;
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

export type ChannelViewProps = {
  settings: Settings;
  channelName: string;
  channels?: channels[];
  currentChannel: channels;
  threads: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: ChannelViewCursorProps;
  pathCursor: string | null;
  isBot: boolean;
  permissions: Permissions;
};

export type ChannelViewCursorProps = {
  next: string | null;
  prev: string | null;
};

export default function ChannelView(props: ChannelViewProps) {
  return (
    <ChannelPage
      {...props}
      key={props.settings.communityName + props.channelName}
    />
  );
}
