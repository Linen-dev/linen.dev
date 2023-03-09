import { SerializedUser } from '@linen/types';

export function replaceMentions({
  body,
  mentions,
}: {
  body: string | null;
  mentions: SerializedUser[];
}): string | null | undefined {
  if (!body) {
    return body;
  }

  if (!mentions.length) {
    return body;
  }
  return mentions.reduce((prev, curr) => {
    if (curr.externalUserId && curr.displayName) {
      return prev.replaceAll(curr.externalUserId, curr.displayName);
    }
    return prev;
  }, body);
}
