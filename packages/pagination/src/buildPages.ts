import { prisma, accounts } from '@linen/database';

const PAGE_SIZE = 30;

export async function buildPages(account: accounts) {
  const channels = await prisma.channels.findMany({
    where: { accountId: account.id },
  });

  for (const channel of channels) {
    let page = channel.pages || 1;
    let keepLoop = true;

    do {
      const threads = await prisma.threads.findMany({
        select: { id: true, sentAt: true },
        where: {
          channelId: channel.id,
          page: null,
          hidden: false,
          messages: { some: {} },
        },
        orderBy: { sentAt: 'asc' },
        take: PAGE_SIZE,
      });

      if (threads.length === PAGE_SIZE) {
        await prisma.threads.updateMany({
          data: { page },
          where: { id: { in: threads.map((t) => t.id) } },
        });

        await prisma.channels.update({
          data: {
            pages: page,
            lastPageBuildAt: threads[PAGE_SIZE - 1].sentAt,
          },
          where: { id: channel.id },
        });
        page++;
      } else {
        // latest, nothing to do
        keepLoop = false;
      }
      // console.info(
      //   `${account.name || account.id} > ${channel.channelName || channel.id}`,
      //   { threads: threads.length, page, keepLoop }
      // );
    } while (keepLoop);
  }
  return account.name || account.id;
}

export async function cleanUp(accountId?: string) {
  const accounts = await prisma.accounts.findMany({
    ...(accountId && {
      where: { id: accountId },
    }),
  });

  for (const account of accounts) {
    // console.info(`${account.name || account.id}`);

    await prisma.threads.updateMany({
      data: { page: null },
      where: { channel: { account: { id: account.id } } },
    });

    await prisma.channels.updateMany({
      data: { pages: null, lastPageBuildAt: null },
      where: { accountId: account.id },
    });
  }
}
