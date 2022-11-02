import { v4 as uuid } from 'uuid';
import { SerializedMessage } from 'serializers/message';
import { username, SerializedUser } from 'serializers/user';
import { MessageFormat } from '@prisma/client';

export function createMessageImitation({
  message,
  threadId,
  author,
  mentions,
}: {
  message: string;
  threadId: string;
  author: SerializedUser;
  mentions: SerializedUser[];
}): SerializedMessage {
  return {
    id: uuid(),
    body: message,
    sentAt: new Date().toISOString(),
    usersId: author.id,
    mentions,
    attachments: [],
    reactions: [],
    threadId,
    messageFormat: MessageFormat.LINEN,
    author: {
      id: author.id,
      externalUserId: author.externalUserId,
      username: username(author.displayName),
      displayName: author.displayName,
      profileImageUrl: author.profileImageUrl,
      authsId: null,
    },
  };
}
