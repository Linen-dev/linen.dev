import { ThreadsWithMessagesFull } from '@linen/types';
import { encodeCursor } from 'utilities/cursor';
import { PAGE_SIZE } from 'config';

// TODO: Add unit test to this function

export async function buildCursor({
  pathCursor,
  threads,
  sort,
  sentAt,
  direction,
  loadMore = false,
}: {
  pathCursor?: string;
  threads: ThreadsWithMessagesFull[];
  sort?: string;
  sentAt?: string;
  direction?: string;
  loadMore?: boolean;
}): Promise<{
  next: string | null;
  prev: string | null;
}> {
  const hasMore = threads?.length === PAGE_SIZE;

  // if empty, there is no cursor to return
  if (!threads?.length) return { prev: null, next: null };

  // load more
  if (loadMore) {
    if (sort === 'desc') {
      return { prev: encodeCursor(`desc:lt:${threads[0].sentAt}`), next: null };
    } else {
      return {
        prev: null,
        next: encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`),
      };
    }
  }

  // first page
  if (sort === 'asc' && sentAt === '0') {
    return {
      prev: null,
      next: hasMore
        ? encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`)
        : null,
    };
  }

  // back to channel
  if (sort === 'asc' && direction === 'gte') {
    return {
      prev: encodeCursor(`desc:lt:${threads[0].sentAt}`),
      next: hasMore
        ? encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`)
        : null,
    };
  }
  // N page
  if (!!pathCursor) {
    return {
      prev: encodeCursor(`desc:lt:${threads[0].sentAt}`),
      next: hasMore
        ? encodeCursor(`asc:gt:${threads[threads.length - 1].sentAt}`)
        : null,
    };
  }
  // empty, last page
  return {
    prev: encodeCursor(`desc:lt:${threads[0].sentAt}`),
    next: null,
  };
}
