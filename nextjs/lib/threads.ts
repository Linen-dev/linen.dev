import type { accounts, Prisma } from '@prisma/client';
import prisma from '../client';
import { anonymizeMessages } from '../utilities/anonymizeMessages';

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

export const findOrCreateThread = async (thread: Thread) => {
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

export const threadIndex = async ({
  channelId,
  take = 20,
  skip = 0,
  account,
}: {
  channelId: string;
  take?: number;
  skip?: number;
  account: accounts;
}) => {
  const MESSAGES_ORDER_BY = 'desc';
  const threads = await prisma.threads.findMany({
    take: take,
    skip: skip,
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
        orderBy: {
          sentAt: MESSAGES_ORDER_BY,
        },
      },
    },
    where: {
      channelId,
    },
    orderBy: {
      externalThreadId: 'desc',
    },
  });
  const threadsWithMessages = threads.filter(
    (thread) => thread.messages.length > 0
  );
  if (account.anonymizeUsers) {
    return threadsWithMessages.map(anonymizeMessages);
  }
  return threadsWithMessages;
};

export const findThreadById = async (threadId: number) => {
  const MESSAGES_ORDER_BY = 'asc';
  return await prisma.threads
    .findUnique({
      where: { incrementId: threadId },
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

// using unsafe because prisma query raw does not play well with string interpolation
export const findThreadsWithOnlyOneMessage = async (
  channelIds: string[]
): Promise<{ id: string; externalThreadId: string; channelId: string }[]> => {
  const ids = channelIds.map((id) => `'${id}'`).join(' , ');
  const query = `
  select "threads".id as id , "threads"."externalThreadId", "threads"."channelId"
  from "threads" join messages on messages."threadId" = "threads".id 
  where "threads"."channelId" in (${ids})
  group by "threads".id
  having count(*) = 1
  order by "threads"."externalThreadId" desc
  ;`;

  return await prisma.$queryRawUnsafe(query);
};

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

export async function findThreadsByCursor({
  channelId,
  sentAt = '0',
  sort = 'desc',
  limit = 10,
}: {
  channelId: string;
  sentAt?: string;
  sort?: 'desc' | 'asc';
  limit?: number;
}) {
  const whereSentAt = whereBuilder(sort, sentAt);

  return await prisma.threads.findMany({
    take: limit,
    where: {
      sentAt: whereSentAt,
      channelId,
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
        orderBy: { sentAt: sort },
      },
    },
    orderBy: { sentAt: sort },
  });
}

function whereBuilder(sort: 'desc' | 'asc', sentAt: string) {
  // users
  if (sort === 'desc' && sentAt === '0') {
    return { gt: BigInt(sentAt) };
  }
  if (sort === 'desc' && sentAt !== '0') {
    return { lt: BigInt(sentAt) };
  }
  // crawlers
  if (sort === 'asc' && sentAt === '0') {
    return { gt: BigInt(sentAt) };
  }
  if (sort === 'asc' && sentAt !== '0') {
    return { gt: BigInt(sentAt) };
  }
}
