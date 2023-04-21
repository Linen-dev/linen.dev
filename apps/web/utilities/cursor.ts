import { FindThreadsByCursorType } from '@linen/types';

// flag to help debug locally, it will use the cursor without encode it
const SKIP_ENCODE_CURSOR = process.env.SKIP_ENCODE_CURSOR === 'true';

export function encodeCursor(data: string) {
  return SKIP_ENCODE_CURSOR ? data : Buffer.from(data).toString('base64');
}

const defaultCursor: FindThreadsByCursorType = {
  sort: 'desc',
  direction: 'gt',
  sentAt: '0',
};

export function decodeCursor(data?: string): FindThreadsByCursorType {
  if (!data) return defaultCursor;
  try {
    const decoded = SKIP_ENCODE_CURSOR
      ? data
      : Buffer.from(data, 'base64').toString();
    const split = decoded?.split(':');
    if (split.length === 3) {
      return {
        sort: split[0] === 'asc' ? 'asc' : 'desc',
        direction: split[1] as 'gt' | 'lt' | 'gte',
        sentAt: split[2],
      };
    }
  } catch (error) {
    console.error(error);
  }
  return defaultCursor;
}
