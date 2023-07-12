import { prisma } from '@linen/database';
import { MessageFormat } from '@linen/types';
import { config } from 'config';

const messageTemplate = ({
  name,
  description,
  slackDomain,
}: {
  slackDomain: string | null;
  description: string | null;
  name: string | null;
}) =>
  [
    `New community created: *${name}* 🎉`,
    description,
    `https://www.linen.dev/s/${slackDomain}`,
  ].join('\n\n');

export async function notifyFeed(id: string) {
  const newAccount = await prisma.accounts.findFirst({
    select: { slackDomain: true, description: true, name: true },
    where: { id },
  });
  if (!newAccount?.description) {
    return;
  }

  const linenBot = await findOrCreateLinenBot();
  const channel = await findOrCreateFeedChannel();
  const body = messageTemplate({
    name: newAccount.name,
    description: newAccount.description,
    slackDomain: newAccount.slackDomain,
  });

  await createThread({
    body,
    channelId: channel.id,
    linenBotId: linenBot.id,
  });
}

async function findOrCreateFeedChannel() {
  let channel = await prisma.channels.findUnique({
    where: { id: config.linen.feedChannelId },
  });
  if (!channel) {
    channel = await prisma.channels.create({
      data: {
        channelName: 'feed',
        id: config.linen.feedChannelId,
        type: 'PUBLIC',
        viewType: 'CHAT',
        account: {
          connectOrCreate: {
            where: { id: config.linen.communityId },
            create: { id: config.linen.communityId },
          },
        },
      },
    });
  }
  return channel;
}

async function findOrCreateLinenBot() {
  let linenBot = await prisma.users.findUnique({
    where: {
      externalUserId_accountsId: {
        accountsId: config.linen.communityId,
        externalUserId: config.linen.bot.externalId,
      },
    },
  });
  if (!linenBot) {
    linenBot = await prisma.users.create({
      data: {
        isAdmin: false,
        isBot: true,
        accountsId: config.linen.communityId,
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
