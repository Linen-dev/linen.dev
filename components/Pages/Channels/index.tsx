import {
  channels,
  messages,
  MessagesViewType,
  slackMentions,
  slackThreads,
  users,
} from '@prisma/client';
import { Settings } from 'services/communities';
import { MentionsWithUsers } from 'types/apiResponses/threads/[threadId]';
import Channel from './Channel';
import ChannelChatView from './ChannelChatView';

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

interface threads extends slackThreads {
  messages: message[];
}

export type messageWithAuthor = messages & {
  author: users | null;
  mentions: (slackMentions & {
    users: users;
  })[];
};

export type Props = {
  slackUrl?: string;
  slackInviteUrl?: string;
  settings: Settings;
  communityName: string;
  channelId?: string;
  users: users[];
  channels?: channels[];
  currentChannel: channels;
  threads?: threads[];
  messages?: messageWithAuthor[];
  pagination?: PaginationType;
  page: number;
  isSubDomainRouting: boolean;
};

export default function ChannelView(props: Props) {
  if (props?.settings?.messagesViewType === MessagesViewType.MESSAGES) {
    return <ChannelChatView {...props} />;
  } else {
    return <Channel {...props} />;
  }
}
