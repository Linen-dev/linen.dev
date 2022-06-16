import {
  accounts,
  channels,
  slackAuthorizations,
  Prisma,
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
    select: {
      slackDomain: true,
      discordDomain: true,
      redirectDomain: true,
      channels: true,
    },
    where: {
      OR: [
        {
          slackTeamId: { not: null },
        },
        {
          discordServerId: { not: null },
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

export const channelIndex = async (accountId: string) => {
  return await prisma.channels.findMany({
    where: {
      accountId,
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
    include: {
      channels: {
        where: {
          hidden: false,
        },
      },
    },
  });
};

//TODO figure out a way to quickly filter out channels based on accountID
export const channelsGroupByThreadCount = async () => {
  return await prisma.slackThreads.groupBy({
    by: ['channelId'],
    _count: {
      id: true,
    },
  });
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
  return await prisma.slackThreads.count({
    where: {
      channelId,
      messageCount: {
        gt: 1,
      },
    },
  });
};

export const threadIndex = async (
  channelId: string,
  take: number = 20,
  skip: number = 0
) => {
  const anonymousCommunity = await prisma.accounts.findFirst({
    select: { anonymizeUsers: true },
    where: {
      channels: {
        some: { id: channelId },
      },
      anonymizeUsers: true,
    },
  });
  const MESSAGES_ORDER_BY = 'desc';
  const threads = await prisma.slackThreads.findMany({
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
        },
        orderBy: {
          sentAt: MESSAGES_ORDER_BY,
        },
      },
    },
    where: {
      channelId,
      messageCount: {
        gt: 1,
      },
    },
    orderBy: {
      slackThreadTs: 'desc',
    },
  });
  const threadsWithMessages = threads
    .filter((thread) => thread.messages.length > 0)
    .map((thread) => {
      thread.messages = mergeMessagesByUserId(
        thread.messages,
        MESSAGES_ORDER_BY
      );
      return thread;
    });
  if (anonymousCommunity) {
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
