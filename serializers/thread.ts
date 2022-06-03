import { MentionsWithUsers } from '../types/apiResponses/threads/[threadId]';
import {
  SlackThreadsWithMessages,
  MessageWithAuthor,
} from '../types/partialTypes';
import serializeUser from '../serializers/user';

interface SerializedMessage {
  body: string;
  sentAt: string;
  author: string;
  mentions: MentionsWithUsers[];
}

interface SerializedThread {
  messages: SerializedMessage[];
}

export default function serialize(
  thread: SlackThreadsWithMessages
): SerializedThread {
  return {
    ...thread,
    messages: thread.messages.map((message: MessageWithAuthor) => {
      const mentions = message.mentions
        ? message.mentions.map((mention: any) => {
            mention.users = serializeUser(mention.users);
            return mention;
          })
        : [];
      return {
        body: message.body,
        // Have to convert to string b/c Nextjs doesn't support date hydration -
        // see: https://github.com/vercel/next.js/discussions/11498
        sentAt: message.sentAt.toJSON(),
        author: serializeUser(message.author),
        mentions,
      };
    }),
  };
}
