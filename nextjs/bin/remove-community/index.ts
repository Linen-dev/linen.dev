import { findArgAndParseOrThrow } from 'utilities/processArgs';
import prisma from '../../client';

console.log(process.env.DATABASE_URL);

async function cleanUp() {
  const accountId = findArgAndParseOrThrow('accountId');

  const channels = await prisma.channels.findMany({ where: { accountId } });

  for (const channel of channels) {
    const mentionsCount = await prisma.mentions.deleteMany({
      where: { messages: { channelId: channel.id } },
    });
    console.log(channel.channelName, 'mentionsCount', mentionsCount);
    const messageCount = await prisma.messages.deleteMany({
      where: { channelId: channel.id },
    });
    console.log(channel.channelName, 'messageCount', messageCount);
    const threadCount = await prisma.threads.deleteMany({
      where: { channelId: channel.id },
    });
    console.log(channel.channelName, 'threadCount', threadCount);
  }

  const channelsCount = await prisma.channels.deleteMany({
    where: { accountId },
  });
  console.log('channelsCount', channelsCount);

  const invitesCount = await prisma.invites.deleteMany({
    where: { accountsId: accountId },
  });
  console.log('invitesCount', invitesCount);

  const usersCount = await prisma.users.deleteMany({
    where: { accountsId: accountId },
  });
  console.log('usersCount', usersCount);
  const authsCount = await prisma.auths.deleteMany({
    where: { accountId },
  });
  console.log('authsCount', authsCount);
  const slackCount = await prisma.slackAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  console.log('slackCount', slackCount);
  const discordCount = await prisma.discordAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  console.log('discordCount', discordCount);
  const accountCount = await prisma.accounts.delete({
    where: { id: accountId },
  });
  console.log('accountCount', accountCount);
}

cleanUp().catch(console.error);
