import { prisma } from '@linen/database';
import { slugify } from '@linen/utilities/string';
import fs from 'fs/promises';

(async function () {
  await fs.mkdir('.local/slug', { recursive: true });

  let last = await fs
    .readFile(`.local/slug/last`, { encoding: 'utf-8' })
    .then((v) => BigInt(v))
    .catch((e) => {
      return BigInt(0);
    });

  let sentAt = last;

  do {
    const threads = await prisma.threads.findMany({
      select: {
        slug: true,
        messages: {
          select: {
            body: true,
          },
          orderBy: { sentAt: 'asc' },
        },
        sentAt: true,
        id: true,
      },
      where: { sentAt: { gt: sentAt } },
      orderBy: { sentAt: 'asc' },
      take: 10,
    });

    const queries = [];
    for (const thread of threads) {
      const slug = slugify(thread.messages[0].body);
      if (thread.slug !== slug) {
        queries.push(
          prisma.threads.update({
            where: { id: thread.id },
            data: { slug },
          })
        );
      }
    }
    await Promise.all(queries);

    if (threads.length) {
      sentAt = threads[threads.length - 1].sentAt;
      console.log({ sentAt });
      await fs.writeFile(`.local/slug/last`, sentAt.toString());
    } else {
      break;
    }
  } while (true);
})();
