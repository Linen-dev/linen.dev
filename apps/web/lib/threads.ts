import type { Prisma } from '@prisma/client';
import { FindThreadsByCursorType } from 'types/cursor';
import { ThreadsWithMessagesFull } from 'types/partialTypes';
import prisma from '../client';
import { anonymizeMessages } from 'utilities/anonymizeMessages';

export type Thread = {
  externalThreadId: string;
  channelId: string;
  sentAt: number | bigint;
  slug: string;
};

export const updateSlackThread = async (
  id: string,
  thread: Prisma.threadsUpdateInput
) => {
  return await prisma.threads.update({
    where: {
      id: id,
    },
    data: thread,
  });
};

export const findOrCreateThread = async (thread: {
  channelId: string;
  externalThreadId: string;
  sentAt: number;
  lastReplyAt: number;
  slug?: string;
  messageCount?: number;
}) => {
  return await prisma.threads.upsert({
    where: {
      externalThreadId: thread.externalThreadId,
    },
    update: {},
    create: thread,
    include: {
      messages: true,
    },
  });
};

export const findThread = async (externalThreadId: string) => {
  return await prisma.threads.findUnique({
    where: {
      externalThreadId,
    },
    include: {
      messages: true,
    },
  });
};

export const threadCount = async (channelId: string): Promise<number> => {
  return await prisma.threads.count({
    where: {
      channelId,
      messageCount: {
        gt: 0,
      },
    },
  });
};
export const findThreadByIncrementId = async (incrementId: number) => {
  return findThreadWithMessages({ incrementId });
};

export const findThreadById = async (id: string) => {
  return findThreadWithMessages({ id });
};

const findThreadWithMessages = async ({
  incrementId,
  id,
}: {
  incrementId?: number;
  id?: string;
}) => {
  const MESSAGES_ORDER_BY = 'asc';
  return await prisma.threads
    .findUnique({
      where: { incrementId, id },
      include: {
        messages: {
          include: {
            author: true,
            //Don't like how it includes mentions when I just want users
            // waiting on this to flatten it out
            // https://github.com/prisma/prisma/issues/9719
            mentions: {
              include: {
                users: true,
              },
            },
            reactions: true,
            attachments: true,
          },
          orderBy: {
            sentAt: MESSAGES_ORDER_BY,
          },
        },
        channel: {
          include: {
            account: { select: { anonymizeUsers: true } },
          },
        },
      },
    })
    .then((thread) => {
      const account = thread?.channel.account;
      if (thread && account?.anonymizeUsers) {
        return anonymizeMessages(thread);
      }
      return thread;
    });
};

export const findThreadsByChannel = ({
  channelId,
  cursor,
  limit = 10,
}: {
  channelId: string;
  cursor?: number;
  limit?: number;
}) => {
  return prisma.threads.findMany({
    where: {
      channelId,
      sentAt: { gt: cursor || 0 },
      hidden: false,
      messageCount: { gt: 1 },
    },
    take: limit,
    orderBy: { sentAt: 'asc' },
  });
};

// using unsafe because prisma query raw does not play well with string interpolation
// export const findThreadsWithOnlyOneMessage = async (
//   channelIds: string[]
// ): Promise<{ id: string; externalThreadId: string; channelId: string }[]> => {
//   const ids = channelIds.map((id) => `'${id}'`).join(' , ');
//   const query = `
//   select "threads".id as id , "threads"."externalThreadId", "threads"."channelId"
//   from "threads" join messages on messages."threadId" = "threads".id
//   where "threads"."channelId" in (${ids})
//   group by "threads".id
//   having count(*) = 1
//   order by "threads"."externalThreadId" desc
//   ;`;

//   return await prisma.$queryRawUnsafe(query);
// };

// using unsafe because prisma query raw does not play well with string interpolation
export const findThreadsWithNoMessages = async (
  channelIds: string[]
): Promise<{ id: string; externalThreadId: string; channelId: string }[]> => {
  const ids = channelIds.map((id) => `'${id}'`).join(' , ');
  const query = `
  select "threads".id as id , "threads"."externalThreadId", "threads"."channelId"
  from "threads" join messages on messages."threadId" = "threads".id 
  where "threads"."channelId" in (${ids})
  group by "threads".id
  having count(*) = 0
  order by "threads"."externalThreadId" desc
  ;`;

  return await prisma.$queryRawUnsafe(query);
};

export async function findThreadsWithWrongMessageCount() {
  return await prisma.$queryRaw<
    { id: string; count: number; messageCount: number }[]
  >`
  select "threads".id, count(1), "messageCount"
  from "threads" 
  left join messages on messages."threadId" = "threads"."id"
  group by "threads"."id"
  having count(1) != "messageCount" 
  order by "threads"."id" desc
  limit 100`;
}

export async function findPinnedThreads({
  channelIds,
  limit = 3,
  anonymizeUsers = false,
}: {
  channelIds: string[];
  limit?: number;
  anonymizeUsers?: boolean;
}): Promise<ThreadsWithMessagesFull[]> {
  if (!channelIds.length) {
    return [];
  }

  const threads = await prisma.threads.findMany({
    take: limit,
    where: {
      channelId: {
        in: channelIds,
      },
      hidden: false,
      pinned: true,
    },
    include: {
      messages: {
        include: {
          author: true,
          mentions: {
            include: {
              users: true,
            },
          },
          reactions: true,
          attachments: true,
        },
        orderBy: { sentAt: 'asc' },
      },
    },
  });
  return (
    anonymizeUsers ? threads.map(anonymizeMessages) : threads
  ) as ThreadsWithMessagesFull[];
}

export async function findThreadsByCursor({
  channelIds,
  sentAt = '0',
  sort = 'desc',
  limit = 30,
  direction = 'lt',
  anonymizeUsers = false,
}: {
  channelIds: string[];
  limit?: number;
  anonymizeUsers?: boolean;
} & FindThreadsByCursorType): Promise<ThreadsWithMessagesFull[]> {
  if (!channelIds.length) {
    return [];
  }

  const threads = await prisma.threads.findMany({
    take: limit,
    where: {
      sentAt: { [direction]: BigInt(sentAt) },
      channelId: {
        in: channelIds,
      },
      hidden: false,
      messageCount: {
        gte: 1,
      },
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        include: {
          author: true,
          mentions: {
            include: {
              users: true,
            },
          },
          reactions: true,
          attachments: true,
        },
        orderBy: { sentAt: 'asc' },
      },
    },
    orderBy: { sentAt: sort },
  });
  return (
    anonymizeUsers ? threads.map(anonymizeMessages) : threads
  ) as ThreadsWithMessagesFull[];
}
