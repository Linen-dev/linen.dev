import { Prisma } from '@prisma/client';
import prisma from '../client';

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

export type MessageParam = {
  body: string;
  sentAt: Date;
  channelId: string;
  slackThreadId?: string;
  usersId?: string;
};

export const createMessage = async (messages: MessageParam) => {
  return await prisma.messages.create({
    data: {
      body: messages.body,
      slackThreadId: messages.slackThreadId,
      channelId: messages.channelId,
      sentAt: messages.sentAt,
      usersId: messages.usersId,
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
    },
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
      channels: true,
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

export const createSlackAuthorization = async (
  slackAuthorization: Prisma.slackAuthorizationsCreateManyInput
) => {
  return await prisma.slackAuthorizations.create({ data: slackAuthorization });
};

export const threadIndex = async (
  channelId: string,
  take: number = 20,
  skip: number = 0
) => {
  return await prisma.slackThreads.findMany({
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
    },
    orderBy: {
      slackThreadTs: 'desc',
    },
  });
};

export const findThreadById = async (threadId: string) => {
  return await prisma.slackThreads.findUnique({
    where: { id: threadId },
    include: {
      messages: {
        include: {
          author: true,
        },
        orderBy: {
          sentAt: 'desc',
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
  });
};
