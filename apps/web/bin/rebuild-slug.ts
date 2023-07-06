import { prisma } from '@linen/database';
import { slugify } from '@linen/utilities/string';

(async function () {
  let sentAt = BigInt(new Date().getTime());

  do {
    const threads = await prisma.threads.findMany({
      select: {
        messages: {
          select: {
            body: true,
          },
          orderBy: { sentAt: 'asc' },
        },
        sentAt: true,
        id: true,
      },
      where: { sentAt: { lt: sentAt } },
      orderBy: { sentAt: 'desc' },
      take: 10,
    });

    const queries = [];
    for (const thread of threads) {
      const slug = slugify(thread.messages.map((m) => m.body).join(' ') || '');
      queries.push(
        prisma.threads.update({
          select: {
            slug: true,
            incrementId: true,
            channel: { select: { account: { select: { slackDomain: true } } } },
          },
          where: { id: thread.id },
          data: { slug },
        })
      );
    }
    console.log(
      await Promise.all(queries).then((arr) =>
        arr.map(
          (t) =>
            `https://www.linen.dev/s/${t.channel.account?.slackDomain}/t/${t.incrementId}/${t.slug}`
        )
      )
    );

    if (threads.length) {
      sentAt = threads[threads.length - 1].sentAt;
      console.log({ sentAt });
    } else {
      break;
    }
  } while (true);
})();
