import type {
  accounts,
  channels,
  mentions,
  messageAttachments,
  messageReactions,
  messages,
  slackAuthorizations,
  threads,
  users,
} from '@linen/database';

// See for reference:
//https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types
// Benefits:
// Cleaner approach as it leverages Prisma Client's generated types
// Reduced maintenance burden and improved type safety when the schema changes

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
