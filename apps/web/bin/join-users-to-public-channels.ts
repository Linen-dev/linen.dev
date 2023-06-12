import { ChannelType, prisma } from '@linen/database';

(async () => {
  const accounts = await prisma.accounts.findMany({ select: { id: true } });

  for (const account of accounts) {
    console.log('account', account);
    const channels = await prisma.channels.findMany({
      select: { id: true },
      where: { accountId: account.id, type: ChannelType.PUBLIC },
    });

    if (channels.length) {
      const users = await prisma.users.findMany({
        select: { id: true },
        where: { accountsId: account.id, authsId: { not: null } },
      });

      if (users.length) {
        for (const user of users) {
          console.log('user', user);
          await prisma.memberships.createMany({
            skipDuplicates: true,
            data: channels.map((c) => ({
              channelsId: c.id,
              usersId: user.id,
            })),
          });
        }
      }
    }
  }
})();
