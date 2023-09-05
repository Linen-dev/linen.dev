import { mentions } from './mentions';
import { users } from './users';
import { accounts } from './accounts';
import { channels } from './channels';
import { messageAttachments } from './messageAttachments';
import { messageReactions } from './messageReactions';
import { messages } from './messages';
import { slackAuthorizations } from './slackAuthorizations';
import { threads } from './threads';

export type ThreadsWithMessagesFull = threads & {
  messages: (messages & {
    mentions: (mentions & {
      users: users | null;
    })[];
    attachments: messageAttachments[];
    reactions: messageReactions[];
    author: users | null;
  })[];
};

export type MessageForSerialization = messages & {
  mentions: (mentions & {
    users: users | null;
  })[];
  attachments?: messageAttachments[];
  reactions?: messageReactions[];
  author: users | null;
};

export type AccountWithSlackAuthAndChannels = accounts & {
  channels: channels[];
  slackAuthorizations: slackAuthorizations[];
};

export type UserMap = {
  id: string;
  externalUserId: string | null;
};

export type ChannelWithAccountAndSlackAuth = channels & {
  account:
    | (accounts & {
        slackAuthorizations: slackAuthorizations[];
      })
    | null;
};
