import { Prisma, slackThreads, users } from '@prisma/client';
import prisma from '../client';
import { UserInfo } from '../interfaces/slackUserInfoInterface';

export const createSlackMessage = async (event: any, channelId: string) => {
  const body = event.event.text;
  const timestamp = event.event.ts;
  const sentAt = new Date(parseFloat(timestamp) * 1000);

  return await prisma.messages.create({
    data: {
      body: body,
      sentAt: sentAt,
      channelId: channelId,
    },
  });
};

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

export const createOrUpdateMessage = async (
  message: Prisma.messagesUncheckedCreateInput
) => {
  const sentAt = new Date(parseFloat(message.slackMessageId) * 1000);
  return await prisma.messages.upsert({
    where: {
      body_sentAt: {
        body: message.body,
        sentAt,
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

export const createAccount = async (account: Prisma.accountsCreateArgs) => {
  return prisma.accounts.create(account);
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

export const udpateAccountName = async (accountId: string, name: string) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { name },
  });
};

export const updateAccountRedirectDomain = async (
  accountId: string,
  domain: string,
  slackUrl: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { redirectDomain: domain, slackUrl },
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

export const createManyChannel = async (
  channels: Prisma.channelsCreateManyInput
) => {
  return await prisma.channels.createMany({ data: channels });
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

export const findOrCreateAccount = async (
  accounts: Prisma.accountsCreateInput
) => {
  return await prisma.accounts.upsert({
    where: {
      slackTeamId: accounts.slackTeamId,
    },
    update: accounts,
    create: accounts,
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
  const threads = await prisma.slackThreads.findMany({
    take: take,
    skip: skip,
    include: {
      messages: {
        include: {
          author: true,
        },
        orderBy: {
          sentAt: 'desc',
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
  return threads.filter((t) => t.messages.length > 0);
};

export const findThreadById = async (threadId: number) => {
  return await prisma.slackThreads.findUnique({
    where: { incrementId: threadId },
    include: {
      messages: {
        include: {
          author: true,
        },
        orderBy: {
          sentAt: 'asc',
        },
      },
      channel: true,
    },
  });
};

export const getThreadWithMultipleMessages = async (channelId: string) => {
  return await prisma.slackThreads;
};

export const findOrCreateUser = async (
  user: Prisma.usersUncheckedCreateInput
) => {
  return await prisma.users.upsert({
    where: {
      slackUserId: user.slackUserId,
    },
    update: {},
    create: user,
  });
};

export const findUser = async (userId: string) => {
  return await prisma.users.findUnique({ where: { slackUserId: userId } });
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
