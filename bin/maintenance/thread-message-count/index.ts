import {
  findThreadsWithWrongMessageCount,
  updateSlackThread,
} from '../../../lib/models';

export async function updateMessagesCount() {
  let page = 0;
  let hasMore;
  do {
    const threads = await findThreadsWithWrongMessageCount();
    for (const thread of threads) {
      await updateSlackThread(thread.id, { messageCount: thread.count });
    }
    hasMore = threads.length;
    console.log(hasMore * page);
    page++;
  } while (hasMore > 0);
}
