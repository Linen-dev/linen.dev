import { encodeCursor } from 'utilities/cursor';
import { PAGE_SIZE } from 'config';

// TODO: Add unit test to this function

export async function buildCursor({
  pathCursor,
  sort,
  sentAt,
  direction,
  total,
  nextDate,
  prevDate,
  loadMore = false,
}: {
  pathCursor?: string;
  sort?: string;
  sentAt?: string;
  direction?: string;
  loadMore?: boolean;
  total: number;
  prevDate: bigint | string;
  nextDate: bigint | string;
}): Promise<{
  next: string | null;
  prev: string | null;
}> {
  const hasMore = total === PAGE_SIZE;

  // if empty, there is no cursor to return
  if (!total) return { prev: null, next: null };

  // load more
  if (loadMore) {
    if (sort === 'desc') {
      return { prev: encodeCursor(`desc:lt:${prevDate}`), next: null };
    } else {
      return {
        prev: null,
        next: encodeCursor(`asc:gt:${nextDate}`),
      };
    }
  }

  // first page
  if (sort === 'asc' && sentAt === '0') {
    return {
      prev: null,
      next: hasMore ? encodeCursor(`asc:gt:${nextDate}`) : null,
    };
  }

  // back to channel
  if (sort === 'asc' && direction === 'gte') {
    return {
      prev: encodeCursor(`desc:lt:${prevDate}`),
      next: hasMore ? encodeCursor(`asc:gt:${nextDate}`) : null,
    };
  }
  // N page
  if (!!pathCursor) {
    return {
      prev: encodeCursor(`desc:lt:${prevDate}`),
      next: hasMore ? encodeCursor(`asc:gt:${nextDate}`) : null,
    };
  }
  // empty, last page
  return {
    prev: encodeCursor(`desc:lt:${prevDate}`),
    next: null,
  };
}
