import {
  accounts,
  channels,
  MessageFormat,
  messages,
  prisma,
  threads,
  users,
} from '@linen/database';

export type LinenUser = Pick<
  users,
  'isBot' | 'displayName' | 'profileImageUrl'
> & {
  externalUserId: string;
};

export type LinenChannel = Pick<channels, 'channelName'> & {
  externalChannelId: string;
};

export type LinenThread = Pick<threads, 'title' | 'sentAt' | 'slug'> & {
  externalThreadId: string;
};

export type LinenMessage = Pick<messages, 'body' | 'sentAt'> & {
  externalMessageId: string;
};

export async function findAccount(externalId: string) {
  return await prisma.accounts.findFirst({
    where: { discordServerId: externalId },
  });
}

export async function checkIntegrations(externalId: string[], botId: number) {
  return await prisma.accounts
    .findMany({
      select: { discordAuthorizations: true, discordServerId: true },
      where: { discordServerId: { in: externalId } },
    })
    .then((accounts) => {
      return accounts.filter((account) => {
        const sortByAsc = account.discordAuthorizations.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        const lastAuth = sortByAsc.pop();
        if (lastAuth) {
          if (lastAuth.scope === `linen-bot-${botId}`) {
            return true;
          } else if (botId === 1 && !lastAuth.customBot) {
            return true;
          }
        }
      });
    });
}

export async function findOrCreateUser(account: accounts, user: LinenUser) {
  return await prisma.users.upsert({
    where: {
      externalUserId_accountsId: {
        accountsId: account.id,
        externalUserId: user.externalUserId,
      },
    },
    create: {
      accountsId: account.id,
      externalUserId: user.externalUserId,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      isBot: user.isBot,
      isAdmin: false,
      // anonymousAlias, // TODO: generate
    },
    update: {
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
    },
  });
}

export async function findOrCreateChannel(
  account: accounts,
  channel: LinenChannel
) {
  const exist = await prisma.channels.findFirst({
    where: {
      accountId: account.id,
      externalChannelId: channel.externalChannelId,
    },
  });

  if (exist) {
    if (exist.channelName !== channel.channelName) {
      return await prisma.channels.update({
        where: {
          id: exist.id,
        },
        data: {
          channelName: channel.channelName,
        },
      });
    } else {
      return exist;
    }
  }
  return await prisma.channels.create({
    data: {
      channelName: channel.channelName,
      accountId: account.id,
      externalChannelId: channel.externalChannelId,
    },
  });
}

export async function findOrCreateThread(
  channel: channels,
  thread: LinenThread
) {
  const exist = await prisma.threads.findFirst({
    include: { channel: { select: { account: true } } },
    where: {
      externalThreadId: thread.externalThreadId,
    },
  });

  if (!exist) {
    return await prisma.threads.create({
      data: {
        sentAt: thread.sentAt,
        channelId: channel.id,
        externalThreadId: thread.externalThreadId,
        slug: thread.slug,
        title: thread.title,
      },
    });
  }

  if (exist.channel.account?.id === channel.accountId) {
    if (exist.title !== thread.title) {
      return await prisma.threads.update({
        where: { id: exist.id },
        data: { title: thread.title },
      });
    }
    return exist;
  } else {
    throw new Error('thread belongs to another account');
  }
}

export async function findOrCreateMessage(
  message: LinenMessage,
  thread: threads,
  user: users,
  mentions: users[]
) {
  const exist = await prisma.messages.findUnique({
    include: { mentions: true },
    where: {
      channelId_externalMessageId: {
        channelId: thread.channelId,
        externalMessageId: message.externalMessageId,
      },
    },
  });

  if (exist) {
    return await prisma.messages.update({
      where: {
        channelId_externalMessageId: {
          channelId: thread.channelId,
          externalMessageId: message.externalMessageId,
        },
      },
      data: {
        body: message.body,
        mentions: {
          createMany: {
            data: mentions.map((m) => ({ usersId: m.id })),
            skipDuplicates: true,
          },
        },
      },
    });
  }

  return await prisma.messages.create({
    data: {
      body: message.body,
      sentAt: message.sentAt,
      usersId: user.id,
      channelId: thread.channelId,
      threadId: thread.id,
      externalMessageId: message.externalMessageId,
      messageFormat: MessageFormat.DISCORD,
      mentions: {
        createMany: {
          data: mentions.map((m) => ({ usersId: m.id })),
          skipDuplicates: true,
        },
      },
    },
  });
}

export async function findChannelById(id: string) {
  return await prisma.channels.findUnique({ where: { id } });
}

export async function findAccountById(id: string) {
  return await prisma.accounts.findUnique({ where: { id } });
}

export async function findIntegrationByAccountId(accountId: string) {
  return await prisma.discordAuthorizations.findFirst({
    where: { accountsId: accountId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findThreadWithMessage(threadId: string) {
  return await prisma.threads.findUnique({
    where: { id: threadId },
    include: {
      messages: {
        include: { author: true, attachments: true },
      },
    },
  });
}

export async function setThreadExternalId(id: string, externalId: string) {
  await prisma.threads.update({
    where: { id },
    data: { externalThreadId: externalId },
  });
}

export async function setMessageExternalId(id: string, externalId: string) {
  await prisma.messages.update({
    where: { id },
    data: { externalMessageId: externalId },
  });
}
