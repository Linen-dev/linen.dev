import { prisma, accounts } from '@linen/database';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { slugify } from '@linen/utilities/string';

const PAGE_SIZE = 30;

async function run() {
  await fs.mkdir('.local/pagination', { recursive: true });
  const accounts = await prisma.accounts.findMany({
    orderBy: [{ redirectDomain: 'asc' }, { createdAt: 'asc' }],
  });
  for (const account of accounts) {
    const accountName = account.name || account.id;
    console.log('accountName', accountName);
    await fs.mkdir(`.local/pagination/${accountName}`, {
      recursive: true,
    });
    await buildPages(account);
  }
}

async function buildPages(account: accounts) {
  const accountName = account.name || account.id;

  const channels = await prisma.channels.findMany({
    where: { accountId: account.id },
  });

  for (const channel of channels) {
    await fs.mkdir(`.local/pagination/${accountName}/${channel.channelName}`, {
      recursive: true,
    });

    if (
      existsSync(`.local/pagination/${accountName}/${channel.channelName}/done`)
    ) {
      console.log(`skip ${accountName} > ${channel.channelName}`);
      continue;
    }

    let page = await fs
      .readFile(
        `.local/pagination/${accountName}/${channel.channelName}/page`,
        { encoding: 'utf-8' }
      )
      .then((v) => Number(v))
      .catch((e) => {
        return Number(1);
      });

    let keepLoop = true;

    let last = await fs
      .readFile(
        `.local/pagination/${accountName}/${channel.channelName}/last`,
        { encoding: 'utf-8' }
      )
      .then((v) => BigInt(v))
      .catch((e) => {
        return BigInt(0);
      });

    let sentAt = last;

    do {
      const threads = await prisma.threads.findMany({
        select: {
          id: true,
          sentAt: true,
          slug: true,
          messages: {
            select: {
              body: true,
            },
            orderBy: { sentAt: 'asc' },
          },
          page: true,
        },
        where: {
          channelId: channel.id,
          hidden: false,
          messageCount: { gt: 0 },
          sentAt: { gt: sentAt },
        },
        orderBy: { sentAt: 'asc' },
        take: PAGE_SIZE,
      });

      const queries = [];
      let fullPage = threads.length === PAGE_SIZE;
      for (const thread of threads) {
        const slug = slugify(thread.messages[0].body);
        let missMatchSlug = thread.slug !== slug;
        let missMatchPage = thread.page !== page;
        if (missMatchSlug || (fullPage && missMatchPage)) {
          queries.push(
            prisma.threads.update({
              where: { id: thread.id },
              data: {
                ...(missMatchSlug ? { slug } : {}),
                ...(missMatchPage ? { page } : {}),
              },
            })
          );
        }
      }
      console.log('queries ' + queries.length);
      await Promise.all(queries);

      if (fullPage) {
        sentAt = threads[PAGE_SIZE - 1].sentAt;
        await prisma.channels.update({
          data: {
            pages: page,
            lastPageBuildAt: sentAt,
          },
          where: { id: channel.id },
        });
        page++;
      } else {
        // latest, nothing to do
        keepLoop = false;
      }
      console.info(`${accountName} > ${channel.channelName}`, {
        threads: threads.length,
        page: fullPage ? page - 1 : page,
        keepLoop,
      });
      await fs.writeFile(
        `.local/pagination/${accountName}/${channel.channelName}/last`,
        sentAt.toString()
      );
      await fs.writeFile(
        `.local/pagination/${accountName}/${channel.channelName}/page`,
        page.toString()
      );
    } while (keepLoop);

    await fs.writeFile(
      `.local/pagination/${accountName}/${channel.channelName}/done`,
      ''
    );
  }
  return accountName;
}

run();
