// ### migration :: build threads sentAt field

// ```
// npx ts-node -P tsconfig.commonjs.json bin/thread-sentAt/index.ts
// ```

import { prisma } from '@linen/database';

async function run() {
  let page = 0;
  let hasMore;
  do {
    hasMore = await buildSentAtForThreads();
    console.log(hasMore * page);
    page++;
  } while (hasMore > 0);
}

async function buildSentAtForThreads() {
  // sentAt by default will have the value 0
  const threads = await prisma.threads.findMany({
    where: { sentAt: { equals: 0 } },
    include: {
      messages: true,
    },
    take: 250,
  });
  await Promise.all(
    threads.map(async (thread) => {
      const message = thread?.messages
        ?.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
        ?.shift();
      if (message) {
        await prisma.threads.update({
          where: { id: thread.id },
          data: {
            sentAt: message.sentAt.getTime(),
            messageCount: thread?.messages?.length || 0,
          },
        });
      } else {
        // if the thread doesn't have messages, we set sentAt as 1, to be able to reprocess it later
        await prisma.threads.update({
          where: { id: thread.id },
          data: {
            sentAt: 1,
            messageCount: 0,
            hidden: true,
          },
        });
      }
    })
  );
  return threads.length;
}

run();
