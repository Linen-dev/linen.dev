import { MentionsWithUsers } from '../types/apiResponses/threads/[threadId]';
import { ThreadsWithMessages, MessageWithAuthor } from '../types/partialTypes';
import { SerializedAttachment, SerializedReaction } from '../types/shared';
import { Prisma } from '@prisma/client';

interface SerializedMessage {
  body: string;
  sentAt: string;
  author: string;
  usersId: string;
  mentions: MentionsWithUsers[];
  attachments: SerializedAttachment[];
  reactions: SerializedReaction[];
}

interface SerializedThread {
  messages: SerializedMessage[];
}

export default function serialize(
  thread: ThreadsWithMessages
): SerializedThread {
  return {
    ...thread,
    messages: thread.messages.map((message: MessageWithAuthor) => {
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
          message.attachments?.map(
            (attachment: Prisma.messageAttachmentsGetPayload<{}>) => {
              return {
                url: attachment.sourceUrl,
                name: attachment.name,
              };
            }
          ) || [],
        reactions:
          message.reactions?.map(
            (reaction: Prisma.messageReactionsGetPayload<{}>) => {
              return {
                type: reaction.name,
                count: reaction.count,
              } as SerializedReaction;
            }
          ) || [],
      };
    }),
  };
}
