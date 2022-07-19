import {
  channels,
  messages,
  MessagesViewType,
  mentions,
  threads,
  users,
} from '@prisma/client';
import { useRouter } from 'next/router';
import { Settings } from 'services/accountSettings';
import { MentionsWithUsers } from 'types/apiResponses/threads/[threadId]';
import Channel from './Channel';
import ChannelChatView from './ChannelChatView';
import { SerializedAttachment, SerializedReaction } from 'types/shared';
import { SerializedThread } from '@/serializers/thread';

export interface PaginationType {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

// The default types doesn't include associations
// maybe look into getting prisma handle association generation
interface message extends messages {
  author: users;
  mentions: MentionsWithUsers[];
}

interface threadsWithMessages extends threads {
  messages: message[];
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
  const router = useRouter();

  if (props?.settings?.messagesViewType === MessagesViewType.MESSAGES) {
    return (
      <ChannelChatView
        {...props}
        key={router.asPath.substring(0, router.asPath.lastIndexOf('/'))}
      />
    );
  } else {
    return <Channel {...props} />;
  }
}
