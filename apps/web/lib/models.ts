import { Prisma, prisma } from '@linen/database';
import { stripProtocol } from '@linen/utilities/url';
import { AccountWithSlackAuthAndChannels } from '../types/partialTypes';
import { promiseMemoize } from 'utilities/promises/memo';

export const createMessageWithMentions = async (
  message: Prisma.messagesUncheckedCreateInput,
  mentionsId: string[]
) => {
  const msg = {
    body: message.body,
    threadId: message.threadId,
    externalMessageId: message.externalMessageId,
    channelId: message.channelId,
    sentAt: message.sentAt,
    usersId: message.usersId,
    messageFormat: message.messageFormat,
  };
  const newMessage = await prisma.messages.upsert({
    include: { mentions: { include: { users: true } }, author: true },
    create: {
      ...msg,
      mentions: {
        create: mentionsId.map((id) => ({ usersId: id })),
      },
    },
    where: {
      channelId_externalMessageId: {
        externalMessageId: message.externalMessageId!,
        channelId: message.channelId,
      },
    },
    update: {
      ...msg,
    },
  });
  if (!!newMessage.threadId) {
    await prisma.threads.updateMany({
      where: {
        id: newMessage.threadId,
        lastReplyAt: { lt: newMessage.sentAt.getTime() },
      },
      data: { lastReplyAt: newMessage.sentAt.getTime() },
    });
  }
  return newMessage;
};

export const deleteMessageFromThread = async (
  messageId: string,
  threadId: string | null
) => {
  await deleteMessageWithMentions(messageId);

  // if thread exists and has no messages, we will remove it
  if (threadId) {
    const messages = await prisma.messages.count({ where: { threadId } });
    if (messages === 0) {
      await prisma.threads.delete({ where: { id: threadId } });
    }
  }
};

export const deleteMessageWithMentions = async (messageId: string) => {
  return await prisma.$transaction([
    prisma.messages.update({
      where: { id: messageId },
      data: { threads: { update: { messageCount: { decrement: 1 } } } },
    }),
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

export const getAccountById = async (accountId: string) => {
  return await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
  });
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
    data: { redirectDomain: stripProtocol(domain).toLowerCase(), communityUrl },
  });
};

const _findAccountByPath = async (domain: string) => {
  const path = domain.toLowerCase();
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

export const findAccountByPath = promiseMemoize(_findAccountByPath);

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
