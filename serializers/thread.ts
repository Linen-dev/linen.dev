import {
  SlackThreadsWithMessages,
  MessageWithAuthor,
} from '../types/partialTypes';

interface SerializedMessage {
  body: string;
  sentAt: string;
  author: string;
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
      return {
        body: message.body,
        // Have to convert to string b/c Nextjs doesn't support date hydration -
        // see: https://github.com/vercel/next.js/discussions/11498
        sentAt: message.sentAt.toString(),
        author: message.author,
      };
    }),
  };
}
