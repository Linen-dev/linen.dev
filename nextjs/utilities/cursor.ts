import { FindThreadsByCursorType } from 'types/cursor';

export function encodeCursor(data: string) {
  return Buffer.from(data).toString('base64');
}

const defaultCursor: FindThreadsByCursorType = {
  sort: 'desc',
  direction: 'gt',
  sentAt: '0',
};

export function decodeCursor(data?: string): FindThreadsByCursorType {
  if (!data) return defaultCursor;
  try {
    const decoded = Buffer.from(data, 'base64').toString();
    const split = decoded?.split(':');
    if (split.length === 3) {
      return {
        sort: split[0] === 'asc' ? 'asc' : 'desc',
        direction: split[1] === 'lt' ? 'lt' : 'gt',
        sentAt: split[2],
      };
    }
  } catch (error) {
    console.error(error);
  }
  return defaultCursor;
}
