import { accounts, prisma, users } from '@linen/database';
import { MessageFormat } from '@linen/types';
import { config } from 'config';

export async function notifyChannels(
  user: users & {
    account: accounts;
  },
  channels: {
    id: string;
    channelName: string;
  }[]
) {
  const displayName = user.account.anonymizeUsers
    ? user.anonymousAlias
    : user.displayName;
  if (!displayName) {
    return;
  }
  const linenBot = await findOrCreateLinenBot(user.account.id);
  const jobs = [];
  for (const channel of channels) {
    if (channel.id !== config.linen.feedChannelId) {
      jobs.push(notifyChannel(channel, linenBot, displayName));
    }
  }
  await Promise.allSettled(jobs);
}

async function notifyChannel(
  channel: { id: string; channelName: string },
  linenBot: users,
  displayName: string
) {
  const lastThread = await prisma.threads.findFirst({
    select: { messages: true, id: true },
    where: { channelId: channel.id },
    orderBy: { sentAt: 'desc' },
  });
  // if last message from channel is from linen-bot, lets append the welcome for the new user
  if (
    lastThread &&
    lastThread.messages.length &&
    lastThread.messages[0].usersId === linenBot.id &&
    lastThread.messages[0].body.startsWith('Welcome')
  ) {
    let body = processMessage(lastThread.messages[0].body, displayName);
    await prisma.messages.update({
      data: {
        body,
      },
      where: { id: lastThread.messages[0].id },
    });
  } else {
    // new thread will be created
    await createThread({
      body: `Welcome! \`${displayName}\` joined #${channel.channelName}.`,
      channelId: channel.id,
      linenBotId: linenBot.id,
    });
  }
}

export function processMessage(body: string, displayName: string) {
  let split = body.split('`');
  if (split.length === 3) {
    body += ` Also, \`${displayName}\` joined.`;
  } else {
    let init = split.splice(0, 3).join('`');
    let joined = split.filter(
      (t) => t !== ' and ' && t !== ', ' && t !== ' joined.'
    );
    const result = `\`${joined.join('`, `')}\` and \`${displayName}\` joined.`;
    body = init.concat(result);
  }
  return body;
}

async function findOrCreateLinenBot(accountId: string) {
  let linenBot = await prisma.users.findUnique({
    where: {
      externalUserId_accountsId: {
        accountsId: accountId,
        externalUserId: config.linen.bot.externalId,
      },
    },
  });
  if (!linenBot) {
    linenBot = await prisma.users.create({
      data: {
        isAdmin: false,
        isBot: true,
        accountsId: accountId,
        externalUserId: config.linen.bot.externalId,
        displayName: config.linen.bot.displayName,
        profileImageUrl: config.linen.squareLogo,
      },
    });
  }
  return linenBot;
}

async function createThread({
  body,
  channelId,
  linenBotId,
}: {
  body: string;
  channelId: string;
  linenBotId: string;
}) {
  await prisma.threads.create({
    data: {
      sentAt: new Date().getTime(),
      feed: true,
      lastReplyAt: new Date().getTime(),
      channel: { connect: { id: channelId } },
      messages: {
        create: {
          body,
          sentAt: new Date(),
          author: { connect: { id: linenBotId } },
          channel: { connect: { id: channelId } },
          messageFormat: MessageFormat.LINEN,
        },
      },
    },
  });
}
