import { MentionsWithUsers } from '../types/apiResponses/threads/[threadId]';
import { MessageWithAuthor } from '../types/partialTypes';
import { SerializedAttachment, SerializedReaction } from '../types/shared';

import type {
  users,
  messageAttachments,
  messageReactions,
} from '@prisma/client';

export interface SerializedMessage {
  id: string;
  body: string;
  sentAt: string;
  usersId: string;
  mentions: MentionsWithUsers[];
  attachments: SerializedAttachment[];
  reactions: SerializedReaction[];
  threadId: string;
  externalId?: string;
  author?: users;
}

function serializeAttachment(
  attachment: messageAttachments
): SerializedAttachment {
  return {
    url: attachment.internalUrl as string,
    name: attachment.name,
  };
}

function serializeReaction(reaction: messageReactions): SerializedReaction {
  return {
    type: reaction.name,
    count: reaction.count as number,
  };
}

export default function serialize(
  message: MessageWithAuthor
): SerializedMessage {
  return {
    id: message.id,
    externalId: message.externalMessageId,
    threadId: message.threadId,
    body: message.body,
    sentAt: message.sentAt.toString(),
    author: message.author,
    usersId: message.usersId,
    mentions: message.mentions || [],
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
