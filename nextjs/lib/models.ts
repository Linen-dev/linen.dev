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
      blocks: message.blocks,
      threadId: message.threadId,
      externalMessageId: message.externalMessageId,
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
  return await prisma.messages.upsert({
    where: {
      channelId_externalMessageId: {
        channelId: message.channelId,
        externalMessageId: message.externalMessageId,
      },
    },
    update: {
      externalMessageId: message.externalMessageId,
    },
    create: {
      body: message.body,
      sentAt,
      channelId: message.channelId,
      externalMessageId: message.externalMessageId,
      usersId: null,
    },
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
      syncStatus: 'DONE',
    },
  });
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

export const channelsGroupByThreadCount = async (accountId: string) => {
  return await prisma.threads.groupBy({
    where: { channel: { account: { id: accountId } } },
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

export type Thread = {
  externalThreadId: string;
  channelId: string;
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
        },
        orderBy: {
          sentAt: MESSAGES_ORDER_BY,
        },
      },
    },
    where: {
      channelId,
      messageCount: {
        gt: 0,
      },
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

export const findOrCreateUser = async (
  user: Prisma.usersUncheckedCreateInput
) => {
  return await prisma.users.upsert({
    where: {
      externalUserId_accountsId: {
        accountsId: user.accountsId,
        externalUserId: user.externalUserId,
      },
    },
    update: {},
    create: user,
  });
};

export const findUser = async (userId: string, accountId: string) => {
  return await prisma.users.findUnique({
    where: {
      externalUserId_accountsId: {
        accountsId: accountId,
        externalUserId: userId,
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
    externalUserId: user.id,
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

export const findOrCreateUserFromUserInfo = async (
  externalUserId: string,
  channel: channels & {
    account: (accounts & { slackAuthorizations: slackAuthorizations[] }) | null;
  }
) => {
  let user = await findUser(externalUserId, channel.accountId as string);
  if (user === null) {
    const accessToken = channel.account?.slackAuthorizations[0]?.accessToken;
    if (!!accessToken) {
      const slackUser = await getSlackUser(externalUserId, accessToken);
      //check done above in channel check
      user = await createUserFromUserInfo(slackUser, channel.accountId!);
    }
  }
  return user;
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
    },
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
  select "threads".id, count(1), "messageCount"
  from "threads" 
  left join messages on messages."threadId" = "threads"."id"
  group by "threads"."id"
  having count(1) != "messageCount" 
  order by "threads"."id" desc
  limit 100`;
}

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
