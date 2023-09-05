import type {
  SerializedAttachment,
  SerializedMessage,
  SerializedUser,
  MessageForSerialization,
  SerializedSearchMessage,
  UploadedFile,
} from '@linen/types';
import { serializeUser } from './user';
import { serializeReaction } from './reaction';
import type {
  users,
  mentions,
  threads,
  messageAttachments,
  messageReactions,
} from '@linen/database';
import { v4 as uuid } from 'uuid';
import { username } from './user';
import { MessageFormat } from '@linen/types';

function serializeAttachment(
  attachment: messageAttachments
): SerializedAttachment {
  return {
    url: attachment.internalUrl as string,
    name: attachment.name,
  };
}

type MentionsForSerialization = mentions & { users?: users | null };

function serializeMentions(
  mentions?: MentionsForSerialization[]
): SerializedUser[] {
  if (!mentions) {
    return [];
  }
  return mentions
    .filter((mention: MentionsForSerialization) => mention.users)
    .map((mention: MentionsForSerialization) =>
      serializeUser(mention.users as users)
    );
}

export function serializeMessage(
  message: MessageForSerialization
): SerializedMessage {
  return {
    id: message.id,
    externalId: message.externalMessageId || null,
    threadId: message.threadId!,
    body: message.body,
    sentAt: message.sentAt.toString(),
    author: message.author ? serializeUser(message.author) : null,
    usersId: message.usersId!,
    messageFormat: message.messageFormat!,
    mentions: serializeMentions(message.mentions),
    attachments:
      message.attachments
        ?.filter(({ internalUrl }: messageAttachments) => Boolean(internalUrl))
        ?.map(serializeAttachment) || [],
    reactions:
      message.reactions
        ?.filter(
          (reaction: messageReactions) =>
            typeof reaction.count === 'number' && reaction.count > 0
        )
        ?.map(serializeReaction) || [],
  };
}

export function serializeSearchedMessage(
  message: MessageForSerialization & { threads: threads | null }
): SerializedSearchMessage {
  return {
    ...serializeMessage(message),
    channelId: message.channelId,
    thread: {
      incrementId: message.threads?.incrementId,
      slug: message.threads?.slug,
    },
  };
}

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
    externalId: null,
    author: {
      id: author.id,
      externalUserId: author.externalUserId,
      username: username(author.displayName),
      displayName: author.displayName,
      profileImageUrl: author.profileImageUrl,
      authsId: null,
      role: author.role,
    },
  };
}
