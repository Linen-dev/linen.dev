import { type JobHelpers } from 'graphile-worker';
import { prisma } from '@linen/database';
import { KeepAlive } from '../helpers/keep-alive';

const batchSize = 1000;

export const updateMessagesCount = async (_: any, helpers: JobHelpers) => {
  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await task();

  keepAlive.end();
};

async function task() {
  let incrementId = 999999999;
  console.time('thread-messages-count');
  do {
    const threads = await prisma.threads.findMany({
      select: {
        messages: { select: { id: true } },
        messageCount: true,
        id: true,
        incrementId: true,
      },
      where: { incrementId: { lt: incrementId } },
      orderBy: { incrementId: 'desc' },
      take: batchSize,
    });
    const queries = [];
    for (let thread of threads) {
      if (!thread.messages.length || thread.messages.length === 0) {
        console.log('thread will be deleted', thread.id);
        queries.push(
          prisma.threads.delete({
            where: { id: thread.id },
          })
        );
      } else if (thread.messageCount !== thread.messages.length) {
        console.log('thread will be updated', thread.id);
        queries.push(
          prisma.threads.update({
            where: { id: thread.id },
            data: { messageCount: thread.messages.length },
          })
        );
      }
    }
    console.timeLog('thread-messages-count');
    await prisma.$transaction(queries);
    if (threads.length === batchSize) {
      incrementId = threads[batchSize - 1].incrementId;
      console.log('incrementId', incrementId);
    } else {
      break;
    }
  } while (true);
  console.timeEnd('thread-messages-count');
}
