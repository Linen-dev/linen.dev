import { prisma } from '@linen/database';
import { ChannelType, AccountType } from './types';

export async function getAccountsAndChannels() {
  console.time('query-accounts');
  const accountsDb = await prisma.accounts.findMany({
    select: {
      id: true,
      redirectDomain: true,
      slackDomain: true,
      discordDomain: true,
      discordServerId: true,
      premium: true,
      channels: {
        select: { id: true, channelName: true, pages: true },
        where: { hidden: false },
      },
    },
    where: {
      type: 'PUBLIC',
      OR: [
        { redirectDomain: { not: null } },
        { slackDomain: { not: null } },
        { discordDomain: { not: null } },
        { discordServerId: { not: null } },
      ],
    },
    orderBy: [{ premium: 'desc' }, { createdAt: 'desc' }],
  });

  const accountsFree: Record<string, AccountType> = {};
  const accountsPremium: Record<string, AccountType> = {};
  const channels: Record<string, ChannelType> = {};

  accountsDb
    .filter((a) => a.channels.length)
    .forEach((a) => {
      const customDomain = a.premium ? a.redirectDomain : null;
      const pathDomain = a.slackDomain
        ? '/s/' + a.slackDomain
        : '/d/' + (a.discordDomain || a.discordServerId);

      (customDomain ? accountsPremium : accountsFree)[a.id] = {
        id: a.id,
        customDomain,
        pathDomain,
        premium: a.premium,
        channels: a.channels,
      };

      a.channels.forEach((c) => {
        channels[c.id] = {
          ...c,
          account: {
            id: a.id,
            customDomain,
            pathDomain,
          },
        };
      });
    });

  console.timeEnd('query-accounts');
  return { channels, accountsPremium, accountsFree };
}
