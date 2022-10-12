import { Prisma } from '@prisma/client';
import prisma from '../client';
import { stripProtocol } from '../utilities/url';
import { AccountWithSlackAuthAndChannels } from '../types/partialTypes';

export const createMessage = async (
  message: Prisma.messagesUncheckedCreateInput
) => {
  return await prisma.messages.create({
    data: {
      body: message.body,
      blocks: message.blocks,
      threadId: message.threadId,
      externalMessageId: message.externalMessageId,
      channelId: message.channelId,
      sentAt: message.sentAt,
      usersId: message.usersId,
      messageFormat: message.messageFormat,
    },
  });
};

export const createMessageWithMentions = async (
  message: Prisma.messagesUncheckedCreateInput,
  mentionsId: string[]
) => {
  return await prisma.messages.create({
    include: { mentions: true },
    data: {
      body: message.body,
      blocks: message.blocks,
      threadId: message.threadId,
      externalMessageId: message.externalMessageId,
      channelId: message.channelId,
      sentAt: message.sentAt,
      usersId: message.usersId,
      messageFormat: message.messageFormat,
      mentions: {
        create: mentionsId.map((id) => ({ usersId: id })),
      },
    },
  });
};

export const deleteMessageWithMentions = async (messageId: string) => {
  return await prisma.$transaction([
    prisma.mentions.deleteMany({
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
  //TODO: Make sure externalMessageId exists
  const sentAt = new Date(parseFloat(message.externalMessageId!) * 1000);
  const toUpsert: Prisma.messagesUncheckedCreateInput = {
    body: message.body,
    sentAt,
    channelId: message.channelId,
    externalMessageId: message.externalMessageId,
    usersId: message.usersId,
    messageFormat: message.messageFormat,
    threadId: message.threadId,
  };
  return await prisma.messages.upsert({
    where: {
      channelId_externalMessageId: {
        channelId: message.channelId,
        externalMessageId: message.externalMessageId!,
      },
    },
    update: toUpsert,
    create: toUpsert,
  });
};

export const updateMessageThreadId = async (
  messageId: string,
  threadId: string
) => {
  return prisma.messages.update({
    where: { id: messageId },
    data: {
      threadId,
    },
  });
};

export const findAccount = async (accounts: Prisma.accountsFindUniqueArgs) => {
  return await prisma.accounts.findUnique(accounts);
};

export const findAccountById = async (
  accountId: string
): Promise<AccountWithSlackAuthAndChannels | null> => {
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

export const findUserAndAccountByIdAndEmail = async (
  id: string,
  email: string
) => {
  const auth = await prisma.auths.findFirst({
    where: { email, users: { some: { account: { id } } } },
    include: {
      users: { include: { account: { include: { featureFlags: true } } } },
    },
  });
  if (!auth) {
    return null;
  }
  const user = auth.users.find((u) => u.accountsId === id);
  return user ? user : null;
};

export const findAuthByEmail = async (email: string) => {
  return await prisma.auths.findUnique({
    where: { email },
    include: { users: { include: { account: true } } },
  });
};

export const findAccountAndUserByEmail = async (email?: string | null) => {
  if (!email) {
    return null;
  }
  const auth = await prisma.auths.findFirst({
    where: { email },
    include: { users: true },
  });
  if (!auth || !auth.accountId) {
    return null;
  }
  const account = await prisma.accounts.findFirst({
    where: { id: auth.accountId as string },
    include: {
      slackAuthorizations: true,
      discordAuthorizations: true,
    },
  });
  const user = auth.users.find((u) => u.accountsId === auth.accountId);
  return { account, user };
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
      syncStatus: 'DONE',
    },
  });
};

export const updateAccountName = async (accountId: string, name: string) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { name },
  });
};

export const updateAccountSyncStatus = async (
  accountId: string,
  status: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { syncStatus: status },
  });
};

export const updateAccountRedirectDomain = async (
  accountId: string,
  domain: string,
  communityUrl: string
) => {
  return await prisma.accounts.update({
    where: { id: accountId },
    data: { redirectDomain: stripProtocol(domain), communityUrl },
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

export const accountWithPermissionsInclude =
  Prisma.validator<Prisma.accountsArgs>()({
    include: {
      featureFlags: true,
      slackAuthorizations: true,
      discordAuthorizations: true,
    },
  });

export type AccountWithPermissions = Prisma.accountsGetPayload<
  typeof accountWithPermissionsInclude
>;

export const findAccountByPath = async (path: string) => {
  return await prisma.accounts.findFirst({
    ...accountWithPermissionsInclude,
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

export const createManyChannel = async (
  channels: Prisma.channelsCreateManyInput
) => {
  return await prisma.channels.createMany({
    data: channels,
    skipDuplicates: true,
  });
};

export const findOrCreateChannel = async (channels: {
  externalChannelId: string;
  channelName: string;
  accountId: string;
  hidden?: boolean;
}) => {
  return await prisma.channels.upsert({
    where: {
      externalChannelId: channels.externalChannelId,
    },
    update: {},
    create: {
      accountId: channels.accountId,
      channelName: channels.channelName,
      externalChannelId: channels.externalChannelId,
      hidden: channels.hidden,
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

export const findMessagesWithThreads = async (accountId: string) => {
  return await prisma.messages.findMany({
    where: {
      NOT: [{ threadId: null }],
      channel: { accountId: accountId },
    },
    include: {
      threads: true,
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
      externalMessageId: ts,
    },
  });
};

export const findMessageByTs = async (ts: string) => {
  return prisma.messages.findFirst({ where: { externalMessageId: ts } });
};

export const updateNextPageCursor = async (
  channelId: string,
  externalPageCursor: string
) => {
  return await prisma.channels.update({
    where: {
      id: channelId,
    },
    data: {
      externalPageCursor,
    },
  });
};

export const findMessagesFromChannel = async ({
  channelId,
  page,
}: {
  channelId: string;
  page?: number;
}) => {
  const where = { channel: { id: channelId }, threadId: null };
  const total = await prisma.messages.count({ where });
  const take = 10;
  const pages = Math.floor(total / take);
  const currentPage = (page || 1) - 1;
  const skip = currentPage * take;
  const messages = await prisma.messages.findMany({
    include: {
      author: true,
      mentions: { include: { users: true } },
      reactions: true,
      attachments: true,
    },
    orderBy: { sentAt: 'desc' },
    where,
    take,
    skip,
  });
  return { total, messages, pages, currentPage };
};

export const findChannelsWithSingleMessages = async (accountId: string) => {
  return await prisma.channels.findMany({
    where: {
      accountId,
      messages: { some: { threadId: null } },
      hidden: false,
    },
  });
};

export const accountsWithDomain = async () => {
  return prisma.accounts.findMany({
    select: { redirectDomain: true },
    where: { redirectDomain: { not: null } },
  });
};
