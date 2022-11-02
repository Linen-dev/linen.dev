import { v4 as uuid } from 'uuid';
import { SerializedMessage } from 'serializers/message';
import { SerializedUser } from 'serializers/user';
import { MessageFormat, Roles } from '@prisma/client';

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
      displayName: author.displayName,
      profileImageUrl: author.profileImageUrl,
      isBot: false,
      isAdmin: false,
      anonymousAlias: null,
      accountsId: 'fake-account-id',
      authsId: null,
      role: Roles.MEMBER,
    },
  };
}
