import {
  findThreadsWithWrongMessageCount,
  updateSlackThread,
} from '../../lib/models';

async function fixMessagesCount() {
  let page = 0;
  let hasMore;
  do {
    console.log('page', page);
    const threads = await findThreadsWithWrongMessageCount(page);
    for (const thread of threads) {
      await updateSlackThread(thread.id, { messageCount: thread.count });
    }
    hasMore = threads.length;
    page += threads.length;
  } while (hasMore > 0);
}

(async () => {
  await fixMessagesCount();
})();
