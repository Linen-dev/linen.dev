import { v4 as uuid } from 'uuid';
import { SerializedMessage } from 'serializers/message';
import { username, SerializedUser } from 'serializers/user';
import { UploadedFile } from 'types/shared';
import { MessageFormat } from '@prisma/client';

export function createMessageImitation({
  message,
  files,
  threadId,
  author,
  mentions,
}: {
  message: string;
  files: UploadedFile[];
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
    attachments: files.map((file) => {
      return { name: file.id, url: file.url };
    }),
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
