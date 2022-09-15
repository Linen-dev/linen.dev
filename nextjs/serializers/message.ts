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
  author?: users;
  usersId: string;
  mentions: MentionsWithUsers[];
  attachments: SerializedAttachment[];
  reactions: SerializedReaction[];
}

export default function serialize(
  message: MessageWithAuthor
): SerializedMessage {
  return {
    id: message.id,
    body: message.body,
    // Have to convert to string b/c Nextjs doesn't support date hydration -
    // see: https://github.com/vercel/next.js/discussions/11498
    sentAt: message.sentAt.toString(),
    author: message.author,
    usersId: message.usersId,
    mentions: message.mentions || [],
    attachments:
      message.attachments
        ?.map((attachment: messageAttachments) => {
          return {
            url: attachment.internalUrl,
            name: attachment.name,
          };
        })
        .filter(({ url }: SerializedAttachment) => Boolean(url)) || [],
    reactions:
      message.reactions
        ?.filter(
          (reaction: messageReactions) =>
            typeof reaction.count === 'number' && reaction.count > 0
        )
        ?.map((reaction: messageReactions) => {
          return {
            type: reaction.name,
            count: reaction.count,
          } as SerializedReaction;
        }) || [],
  };
}
