import { Prisma } from '@prisma/client';

// See for reference:
//https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types
// Benefits:
// Cleaner approach as it leverages Prisma Client's generated types
// Reduced maintenance burden and improved type safety when the schema changes

const threadsWithMessages = Prisma.validator<Prisma.threadsArgs>()({
  include: { messages: true },
});

export type ThreadsWithMessages = Prisma.threadsGetPayload<
  typeof threadsWithMessages
>;

const messageWithAuthor = Prisma.validator<Prisma.MessageArgs>()({
  include: { author: true },
});

export type MessageWithAuthor = Prisma.MessagesGetPayload<
  typeof messageWithAuthor
>;

const messageWithChannel = Prisma.validator<Prisma.MessageArgs>()({
  include: { author: true },
});

export type MessageWithAuthor = Prisma.MessagesGetPayload<
  typeof messageWithAuthor
>;

const accountWithSlackAuthAndChannels = Prisma.validator<Prisma.accountsArgs>()(
  {
    include: {
      slackAuthorizations: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      channels: true,
    },
  }
);

export type AccountWithSlackAuthAndChannels = Prisma.accountsGetPayload<
  typeof accountWithSlackAuthAndChannels
>;

const userMapType = Prisma.validator<Prisma.usersArgs>()({
  select: {
    externalUserId: true,
    id: true,
  },
});
export type UserMap = Prisma.usersGetPayload<typeof userMapType>;
