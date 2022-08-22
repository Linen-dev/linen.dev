import { channels, messages, mentions, users } from '@prisma/client';
import { Settings } from 'services/accountSettings';
import Channel from './Channel';
import { SerializedAttachment, SerializedReaction } from 'types/shared';
import { SerializedThread } from 'serializers/thread';

export type ChannelResponse =
  | { props: ChannelViewProps }
  | { notFound: boolean };

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
  threads?: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: ChannelViewCursorProps;
  pathCursor: string | null;
  isBot: boolean;
};

export type ChannelViewCursorProps = {
  next: string | null;
  prev: string | null;
};

export default function ChannelView(props: ChannelViewProps) {
  return (
    <Channel
      {...props}
      key={props.settings.communityName + props.channelName}
    />
  );
}
