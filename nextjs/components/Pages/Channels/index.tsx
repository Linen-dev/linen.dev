import { channels, messages, mentions, users } from '@prisma/client';
import { Settings } from 'services/accountSettings';
import Channel from './Channel';
import { SerializedAttachment, SerializedReaction } from 'types/shared';
import { SerializedThread } from '@/serializers/thread';

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

export type Props = {
  communityUrl?: string;
  communityInviteUrl?: string;
  settings: Settings;
  communityName: string;
  channelId?: string;
  users: users[];
  channels?: channels[];
  currentChannel: channels;
  threads?: SerializedThread[];
  messages?: messageWithAuthor[];
  pagination?: PaginationType;
  page: number;
  isSubDomainRouting: boolean;
};

export default function ChannelView(props: Props) {
  return <Channel {...props} />;
}
