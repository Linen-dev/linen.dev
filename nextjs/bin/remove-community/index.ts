import { findArgAndParseOrThrow } from 'utilities/processArgs';
import prisma from '../../client';

async function cleanUp() {
  const accountId = findArgAndParseOrThrow('accountId');

  const channels = await prisma.channels.findMany({ where: { accountId } });

  for (const channel of channels) {
    const { count: mentionsCount } = await prisma.mentions.deleteMany({
      where: { messages: { channelId: channel.id } },
    });
    console.log('mentionsCount', mentionsCount);
    const { count: messageCount } = await prisma.messages.deleteMany({
      where: { channelId: channel.id },
    });
    console.log('messageCount', messageCount);
    const { count: threadCount } = await prisma.threads.deleteMany({
      where: { channelId: channel.id },
    });
    console.log('threadCount', threadCount);
  }

  const { count: channelsCount } = await prisma.channels.deleteMany({
    where: { accountId },
  });
  console.log('channelsCount', channelsCount);

  //   const { count: invitesCount } = await prisma.invites.deleteMany({
  //     where: { account: { id: accountId } },
  //   });
  //   console.log('invitesCount', invitesCount);

  const { count: usersCount } = await prisma.users.deleteMany({
    where: { account: { id: accountId } },
  });
  console.log('usersCount', usersCount);
  const { count: authsCount } = await prisma.auths.deleteMany({
    where: { account: { id: accountId } },
  });
  console.log('authsCount', authsCount);
  const { count: slackCount } = await prisma.slackAuthorizations.deleteMany({
    where: { account: { id: accountId } },
  });
  console.log('slackCount', slackCount);
  const { count: discordCount } = await prisma.discordAuthorizations.deleteMany(
    {
      where: { account: { id: accountId } },
    }
  );
  console.log('discordCount', discordCount);
  const { count: accountCount } = await prisma.accounts.deleteMany({
    where: { id: accountId },
  });
  console.log('accountCount', accountCount);
}

cleanUp();
