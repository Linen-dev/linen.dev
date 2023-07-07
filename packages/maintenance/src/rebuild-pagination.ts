import { prisma, accounts } from '@linen/database';
import fs from 'fs';

const PAGE_SIZE = 30;
const isRebuild = true;

async function run() {
  fs.mkdirSync('.local/pagination', { recursive: true });

  const accounts = await prisma.accounts.findMany();
  for (const account of accounts) {
    fs.mkdirSync('.local/pagination/' + (account.name || account.id), {
      recursive: true,
    });
    await buildPages(account);
  }
}

async function buildPages(account: accounts) {
  const channels = await prisma.channels.findMany({
    where: { accountId: account.id },
  });

  for (const channel of channels) {
    if (
      fs.existsSync(
        '.local/pagination/' +
          (account.name || account.id) +
          '/' +
          channel.channelName
      )
    ) {
      console.log(
        `skip ${account.name || account.id} > ${
          channel.channelName || channel.id
        }`
      );
      continue;
    }

    if (isRebuild) {
      // clean up
      await prisma.threads.updateMany({
        data: { page: null },
        where: { channel: { id: channel.id } },
      });

      await prisma.channels.updateMany({
        data: { pages: null, lastPageBuildAt: null },
        where: { id: channel.id },
      });
    }

    let page = isRebuild ? 1 : channel.pages || 1;
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
      console.info(
        `${account.name || account.id} > ${channel.channelName || channel.id}`,
        { threads: threads.length, page, keepLoop }
      );
    } while (keepLoop);
    fs.writeFileSync(
      '.local/pagination/' +
        (account.name || account.id) +
        '/' +
        channel.channelName,
      ''
    );
  }
  return account.name || account.id;
}

run();
