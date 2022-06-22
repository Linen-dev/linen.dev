import {
  accounts,
  channels,
  slackAuthorizations,
  Prisma,
  slackThreads,
  messages,
  users,
  slackMentions,
} from '@prisma/client';
import prisma from '../client';
import { UserInfo } from '../types/slackResponses//slackUserInfoInterface';
import { getSlackUser } from '../services/slack';
import { stripProtocol } from '../utilities/url';
import { anonymizeMessages } from '../utilities/anonymizeMessages';
import { generateRandomWordSlug } from '../utilities/randomWordSlugs';
import { mergeMessagesByUserId } from '../utilities/messages';

export const createMessage = async (
  message: Prisma.messagesUncheckedCreateInput
) => {
  return await prisma.messages.create({
    data: {
      body: message.body,
      slackThreadId: message.slackThreadId,
      slackMessageId: message.slackMessageId,
      channelId: message.channelId,
      sentAt: message.sentAt,
      usersId: message.usersId,
    },
  });
};

export const createMessageWithMentions = async (
  message: Prisma.messagesUncheckedCreateInput,
  mentionsId: string[]
) => {
  return await prisma.messages.create({
    data: {
      body: message.body,
      slackThreadId: message.slackThreadId,
      slackMessageId: message.slackMessageId,
      channelId: message.channelId,
      sentAt: message.sentAt,
      usersId: message.usersId,
      mentions: {
        create: mentionsId.map((id) => ({ usersId: id })),
      },
    },
  });
};

export const deleteMessageWithMentions = async (messageId: string) => {
  return await prisma.$transaction([
    prisma.slackMentions.deleteMany({
      where: {
        messagesId: messageId,
      },
    }),
    prisma.messages.delete({
      where: {
        id: messageId,
      },
    }),
  ]);
};

export const createOrUpdateMessage = async (
  message: Prisma.messagesUncheckedCreateInput
) => {
  //TODO: Make sure slackMessageId exists
  const sentAt = new Date(parseFloat(message.slackMessageId!) * 1000);
  return await prisma.messages.upsert({
    where: {
      channelId_slackMessageId: {
        channelId: message.channelId,
        slackMessageId: message.slackMessageId,
      },
    },
    update: {
      slackMessageId: message.slackMessageId,
    },
    create: {
      body: message.body,
      sentAt,
      channelId: message.channelId,
      slackMessageId: message.slackMessageId,
      usersId: null,
    },
  });
};

export const updateMessageSlackThreadId = async (
  messageId: string,
  slackThreadId: string
) => {
  return prisma.messages.update({
    where: { id: messageId },
    data: {
      slackThreadId,
    },
  });
};

export const findAccount = async (accounts: Prisma.accountsFindUniqueArgs) => {
  return await prisma.accounts.findUnique(accounts);
};

export const findAccountById = async (accountId: string) => {
  return await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    include: {
      slackAuthorizations: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      channels: true,
    },
  });
};

export const findAccountBySlackTeamId = async (slackTeamId: string) => {
  return await prisma.accounts.findFirst({
    where: {
      slackTeamId,
    },
    select: {
      id: true,
    },
  });
};

export const findAccountByEmail = async (email?: string | null) => {
  if (!email) {
    return null;
  }
  const auth = await prisma.auths.findFirst({ where: { email } });
  if (!auth || !auth.accountId) {
    return null;
  }
  return await prisma.accounts.findFirst({
    where: { id: auth.accountId as string },
    include: {
      slackAuthorizations: true,
      discordAuthorizations: true,
    },
  });
};

export const accountsWithChannels = async () => {
  return prisma.accounts.findMany({
    select: { slackDomain: true, redirectDomain: true, channels: true },
    where: {
      NOT: [
        {
          slackTeamId: null,
        },
      ],
      slackSyncStatus: 'DONE',
    },
  });
};

export const updateSlackThread = async (
  id: string,
  thread: Prisma.slackThreadsUpdateInput
) => {
  return await prisma.slackThreads.update({
    where: {
      id: id,
    },
    data: thread,
  });
};

export const updateAccountName = async (accountId: string, name: string) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { name },
  });
};

export const updateAccountSlackSyncStatus = async (
  accountId: string,
  status: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { slackSyncStatus: status },
  });
};

export const updateAccountRedirectDomain = async (
  accountId: string,
  domain: string,
  slackUrl: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { redirectDomain: stripProtocol(domain), slackUrl },
  });
};

export const channelIndex = async (
  accountId: string,
  { hidden }: { hidden?: boolean } = {}
) => {
  return await prisma.channels.findMany({
    where: {
      accountId,
      ...(!!String(hidden) && { hidden }),
    },
  });
};

export const findChannel = async (channelId: string) => {
  return await prisma.channels.findUnique({
    where: { id: channelId },
    include: { account: true },
  });
};

export const findAccountByPath = async (path: string) => {
  return await prisma.accounts.findFirst({
    where: {
      OR: [
        {
          redirectDomain: path,
        },
        {
          slackDomain: path,
        },
        {
          discordDomain: path,
        },
        {
          discordServerId: path,
        },
      ],
    },
  });
};

//TODO figure out a way to quickly filter out channels based on accountID
export const channelsGroupByThreadCount = async (accountId: string) => {
  return await prisma.$queryRaw<{ channelId: string; count: number }[]>`
    select * from channels_stats cs 
    where cs."accountId" = ${accountId}
    `;
};

export const createManyChannel = async (
  channels: Prisma.channelsCreateManyInput
) => {
  return await prisma.channels.createMany({
    data: channels,
    skipDuplicates: true,
  });
};

export const findOrCreateChannel = async (
  channels: Prisma.channelsUncheckedCreateInput
) => {
  return await prisma.channels.upsert({
    where: {
      slackChannelId: channels.slackChannelId,
    },
    update: {},
    create: {
      accountId: channels.accountId,
      channelName: channels.channelName,
      slackChannelId: channels.slackChannelId,
      hidden: channels.hidden,
    },
  });
};

export type Thread = {
  slackThreadTs: string;
  channelId: string;
};

export const findOrCreateThread = async (thread: Thread) => {
  return await prisma.slackThreads.upsert({
    where: {
      slackThreadTs: thread.slackThreadTs,
    },
    update: {},
    create: thread,
    include: {
      messages: true,
    },
  });
};

export const updateAccount = async (
  accountId: string,
  account: Prisma.accountsUpdateInput
) => {
  return await prisma.accounts.update({
    where: {
      id: accountId,
    },
    data: account,
  });
};

export const createSlackAuthorization = async (
  slackAuthorization: Prisma.slackAuthorizationsCreateManyInput
) => {
  return await prisma.slackAuthorizations.create({ data: slackAuthorization });
};

export const createDiscordAuthorization = async (
  discordAuthorization: Prisma.discordAuthorizationsCreateManyInput
) => {
  return await prisma.discordAuthorizations.create({
    data: discordAuthorization,
  });
};

export const threadCount = async (channelId: string): Promise<number> => {
  return await prisma.$queryRaw<{ channelId: string; count: number }[]>`
    select * from channels_stats cs 
    where cs."channelId" = ${channelId}
  `.then((rows) => {
    return rows.reduce((_, curr) => {
      return curr.count;
    }, 0);
  });
};

interface RawResult {
  // thread
  id: string;
  incrementId: number;
  slackThreadTs: string;
  createdAt: Date;
  slug: string;
  messageCount: number;
  channelId: string;
  viewCount: number;
  slackThreadId: string;
  // message
  slackMessageId: string;
  messageId: string;
  usersId: string;
  mentions?: string | null;
  sentAt: Date;
  body: string;
}

type MsgWithMentions = messages &
  (
    | { mentions?: string | null }
    | {
        mentions?: (slackMentions & {
          users: users | null;
        })[];
      }
  );
type ThreadWithMsg = slackThreads & { messages: MsgWithMentions[] };

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
  const threadsRawQuery = await prisma.$queryRaw<RawResult[]>`
  SELECT *, x.id as "messageId" FROM
    ( SELECT 
        m.*, string_agg(sm."usersId", ',') mentions, 
        ROW_NUMBER () OVER (PARTITION BY m."slackThreadId" ORDER BY m."sentAt" asc)
      FROM messages m
      LEFT JOIN "slackMentions" sm ON sm."messagesId" = m.id
      WHERE m."slackThreadId" IN ( 
        SELECT st.id
        FROM "slackThreads" st
        WHERE st."channelId" = ${channelId} AND st."messageCount" > 1
        GROUP BY st."id" 
        ORDER BY st."slackThreadTs" DESC
        LIMIT ${take} OFFSET ${skip}
      )
      GROUP BY m.id 
    ) x
  JOIN "slackThreads" st2 ON st2.id = x."slackThreadId" 
  WHERE ROW_NUMBER < 5
  ORDER BY st2."slackThreadTs" DESC, x."sentAt" desc`;

  const usersId: string[] = [];

  const threads: ThreadWithMsg[] = Object.values(
    threadsRawQuery.reduce((prev: Record<string, ThreadWithMsg>, curr) => {
      if (!prev[curr.id]) {
        prev[curr.id] = {
          id: curr.id,
          incrementId: curr.incrementId,
          slackThreadTs: curr.slackThreadTs,
          slug: curr.slug,
          messageCount: curr.messageCount,
          channelId: curr.channelId,
          viewCount: curr.viewCount,
          messages: [],
        } as ThreadWithMsg;
      }
      prev[curr.id].messages.push({
        createdAt: curr.createdAt,
        slackMessageId: curr.slackMessageId,
        id: curr.messageId,
        usersId: curr.usersId,
        mentions: curr.mentions,
        slackThreadId: curr.slackThreadId,
        sentAt: new Date(curr.sentAt),
        body: curr.body,
      } as MsgWithMentions);

      usersId.push(curr.usersId);
      curr.mentions && usersId.push(...curr.mentions?.split(','));
      return prev;
    }, {})
  );

  const users = await prisma.users.findMany({
    where: { id: { in: usersId.filter(Boolean) } },
  });
  const usersKV: Record<string, users> = users.reduce((prev, curr) => {
    return { ...prev, [curr.id]: curr };
  }, {});

  const threadsWithMessages = threads
    .filter((thread) => thread.messages.length > 0)
    .map((thread) => {
      return {
        ...thread,
        messages: thread.messages.map((message) => {
          const author = message.usersId ? usersKV[message.usersId] : null;
          const mentions = message.mentions
            ? (message.mentions as string)?.split(',').map((mention) => {
                return {
                  messagesId: message.id,
                  usersId: mention,
                  users: usersKV[mention],
                };
              })
            : [];
          return { ...message, author, mentions };
        }),
      };
    })
    .map((thread) => {
      thread.messages = mergeMessagesByUserId(
        thread.messages,
        MESSAGES_ORDER_BY
      );
      return thread;
    });
  if (account.anonymizeUsers) {
    return threadsWithMessages.map(anonymizeMessages);
  }
  return threadsWithMessages;
};

export const findThreadById = async (threadId: number) => {
  const MESSAGES_ORDER_BY = 'asc';
  return await prisma.slackThreads
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
      if (thread) {
        thread.messages = mergeMessagesByUserId(
          thread.messages,
          MESSAGES_ORDER_BY
        );
      }
      if (account?.anonymizeUsers) {
        return anonymizeMessages(thread);
      }
      return thread;
    });
};

export const findOrCreateUser = async (
  user: Prisma.usersUncheckedCreateInput
) => {
  return await prisma.users.upsert({
    where: {
      slackUserId_accountsId: {
        accountsId: user.accountsId,
        slackUserId: user.slackUserId,
      },
    },
    update: {},
    create: user,
  });
};

export const findUser = async (userId: string, accountId: string) => {
  return await prisma.users.findUnique({
    where: {
      slackUserId_accountsId: {
        accountsId: accountId,
        slackUserId: userId,
      },
    },
  });
};

export const createUser = async (user: Prisma.usersUncheckedCreateInput) => {
  return await prisma.users.create({ data: user });
};

export const createUserFromUserInfo = async (
  user: UserInfo,
  accountId: string
) => {
  const profile = user.profile;
  const name =
    profile.display_name ||
    profile.display_name_normalized ||
    profile.real_name ||
    profile.real_name_normalized;
  const profileImageUrl = profile.image_original;
  const param = {
    displayName: name,
    slackUserId: user.id,
    profileImageUrl,
    accountsId: accountId,
    isBot: user.is_bot,
    isAdmin: user.is_admin || false,
    anonymousAlias: generateRandomWordSlug(),
  };

  return await createUser(param);
};

export const createManyUsers = async (users: Prisma.usersCreateManyArgs) => {
  return await prisma.users.createMany(users);
};

export const listUsers = async (accountId: string) => {
  return await prisma.users.findMany({ where: { accountsId: accountId } });
};

export const findMessagesWithThreads = async (accountId: string) => {
  return await prisma.messages.findMany({
    where: {
      NOT: [{ slackThreadId: null }],
      channel: { accountId: accountId },
    },
    include: {
      slackThreads: true,
      channel: true,
    },
    orderBy: {
      sentAt: 'desc',
    },
  });
};

export const findMessageByChannelIdAndTs = async (
  channelId: string,
  ts: string
) => {
  return prisma.messages.findFirst({
    where: {
      channelId: channelId,
      slackMessageId: ts,
    },
  });
};

export const findMessageByTs = async (ts: string) => {
  return prisma.messages.findFirst({ where: { slackMessageId: ts } });
};

export const updateNextPageCursor = async (
  channelId: string,
  slackNextPageCursor: string
) => {
  return await prisma.channels.update({
    where: {
      id: channelId,
    },
    data: {
      slackNextPageCursor,
    },
  });
};

// using unsafe because prisma query raw does not play well with string interpolation
export const findSlackThreadsWithOnlyOneMessage = async (
  channelIds: string[]
): Promise<{ id: string; slackThreadTs: string; channelId: string }[]> => {
  const ids = channelIds.map((id) => `'${id}'`).join(' , ');
  const query = `
  select "slackThreads".id as id , "slackThreads"."slackThreadTs", "slackThreads"."channelId"
  from "slackThreads" join messages on messages."slackThreadId" = "slackThreads".id 
  where "slackThreads"."channelId" in (${ids})
  group by "slackThreads".id
  having count(*) = 1
  order by "slackThreads"."slackThreadTs" desc
  ;`;

  return await prisma.$queryRawUnsafe(query);
};

export const findOrCreateUserFromUserInfo = async (
  slackUserId: string,
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  }
) => {
  let user = await findUser(slackUserId, channel.accountId as string);
  if (user === null) {
    const accessToken = channel.account?.slackAuthorizations[0]?.accessToken;
    if (!!accessToken) {
      const slackUser = await getSlackUser(slackUserId, accessToken);
      //check done above in channel check
      user = await createUserFromUserInfo(slackUser, channel.accountId!);
    }
  }
  return user;
};

// using unsafe because prisma query raw does not play well with string interpolation
export const findSlackThreadsWithNoMessages = async (
  channelIds: string[]
): Promise<{ id: string; slackThreadTs: string; channelId: string }[]> => {
  const ids = channelIds.map((id) => `'${id}'`).join(' , ');
  const query = `
  select "slackThreads".id as id , "slackThreads"."slackThreadTs", "slackThreads"."channelId"
  from "slackThreads" join messages on messages."slackThreadId" = "slackThreads".id 
  where "slackThreads"."channelId" in (${ids})
  group by "slackThreads".id
  having count(*) = 0
  order by "slackThreads"."slackThreadTs" desc
  ;`;

  return await prisma.$queryRawUnsafe(query);
};

export const findMessagesFromChannel = async ({
  channelId,
  page,
}: {
  channelId: string;
  page?: number;
}) => {
  const where = { channel: { id: channelId }, slackThreadId: null };
  const total = await prisma.messages.count({ where });
  const take = 10;
  const pages = Math.floor(total / take);
  const currentPage = (page || 1) - 1;
  const skip = currentPage * take;
  const messages = await prisma.messages.findMany({
    include: { author: true, mentions: { include: { users: true } } },
    orderBy: { sentAt: 'desc' },
    where,
    take,
    skip,
  });
  return { total, messages, pages, currentPage };
};

export async function findThreadsWithWrongMessageCount() {
  return await prisma.$queryRaw<
    { id: string; count: number; messageCount: number }[]
  >`
  select "slackThreads".id, count(1), "messageCount"
  from "slackThreads" 
  left join messages on messages."slackThreadId" = "slackThreads"."id"
  group by "slackThreads"."id"
  having count(1) != "messageCount" 
  order by "slackThreads"."id" desc
  limit 100`;
}

export const findChannelsWithSingleMessages = async ({
  channels,
}: {
  channels: channels[];
}) => {
  return await prisma.channels.findMany({
    where: {
      id: { in: channels.map((c) => c.id) },
      messages: { some: { slackThreadId: null } },
    },
  });
};

export const accountsWithDomain = async () => {
  return prisma.accounts.findMany({
    select: { redirectDomain: true },
    where: { redirectDomain: { not: null } },
  });
};
