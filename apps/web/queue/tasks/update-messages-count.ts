import { type JobHelpers } from 'graphile-worker';
import {
  findThreadsWithWrongMessageCount,
  updateSlackThread,
} from 'lib/threads';

export const updateMessagesCount = async (
  payload: any,
  helpers: JobHelpers
) => {
  let page = 0;
  let hasMore;
  do {
    const threads = await findThreadsWithWrongMessageCount();
    for (const thread of threads) {
      await updateSlackThread(thread.id, { messageCount: thread.count });
    }
    hasMore = threads.length;
    helpers.logger.info(String(hasMore * page));
    page++;
  } while (hasMore > 0);
};
