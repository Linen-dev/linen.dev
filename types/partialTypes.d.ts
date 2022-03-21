import { Prisma } from '@prisma/client';

// See for reference:
//https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types
// Benefits:
// Cleaner approach as it leverages Prisma Client's generated types
// Reduced maintenance burden and improved type safety when the schema changes

const slackThreadsWithMessages = Prisma.validator<Prisma.SlackThreadsArgs>()({
  include: { messages: true },
});

export type SlackThreadsWithMessages = Prisma.SlackThreadsGetPayload<
  typeof slackThreadsWithMessages
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
