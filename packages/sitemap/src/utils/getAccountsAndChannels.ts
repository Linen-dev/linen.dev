import { channels, prisma } from '@linen/database';
import { ChannelType, AccountType } from './types';
import { Logger } from '@linen/types';

export async function getAccountsAndChannels(logger: Logger) {
  logger.time('query-accounts');

  // filter channels with at least 25 threads
  // filter introductions channels
  // filter public channels only
  // filter hidden channels
  const channelsWithThreads = await prisma.$queryRaw<channels[]>`
      select c.*
      from channels c 
      join threads t on c.id = t."channelId" 
      where t.hidden is false 
      and c."channelName" not like '%intro%'
      and c.hidden is false 
      and c."type" = 'PUBLIC'
      group by c.id
      having count(t.id) >= 25
      order by count(t.id) desc
    `;

  const accountIds = Object.keys(
    channelsWithThreads.reduce((prev, curr) => {
      return { ...prev, [curr.accountId!]: true };
    }, {})
  );

  const accountsDb = await prisma.accounts.findMany({
    select: {
      id: true,
      redirectDomain: true,
      slackDomain: true,
      discordDomain: true,
      discordServerId: true,
      premium: true,
    },
    where: {
      type: 'PUBLIC',
      OR: [
        { redirectDomain: { not: null } },
        { slackDomain: { not: null } },
        { discordDomain: { not: null } },
        { discordServerId: { not: null } },
      ],
      id: { in: accountIds },
    },
    orderBy: [{ premium: 'desc' }, { createdAt: 'desc' }],
  });

  const accountsFree: Record<string, AccountType> = {};
  const accountsPremium: Record<string, AccountType> = {};
  const channels: Record<string, ChannelType> = {};

  accountsDb.forEach((a) => {
    const channelsFromAccount = channelsWithThreads.filter(
      (c) => c.accountId === a.id
    );

    const customDomain = a.premium ? a.redirectDomain : null;
    const pathDomain = a.slackDomain
      ? '/s/' + a.slackDomain
      : '/d/' + (a.discordDomain || a.discordServerId);

    (customDomain ? accountsPremium : accountsFree)[a.id] = {
      id: a.id,
      customDomain,
      pathDomain,
      premium: a.premium,
      channels: channelsFromAccount,
    };

    channelsFromAccount.forEach((c) => {
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

  logger.timeEnd('query-accounts');
  return { channels, accountsPremium, accountsFree };
}
