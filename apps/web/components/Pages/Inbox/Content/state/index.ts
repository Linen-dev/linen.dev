import { SerializedMessage, SerializedThread } from '@linen/types';
import { InboxResponse } from '../../types';

export function prependThread(
  thread: SerializedThread,
  message?: SerializedMessage
) {
  return (inbox: InboxResponse) => {
    const { threads, ...rest } = inbox;
    if (message) {
      thread.messages = [
        ...thread.messages.filter((m) => m.id !== message.id),
        message,
      ];
    }
    return {
      ...rest,
      threads: [thread, ...threads.filter((t) => t.id !== thread.id)].splice(
        0,
        10
      ),
    };
  };
}

export function addMessageToThread(
  thread: SerializedThread | undefined,
  threadId: string,
  message: SerializedMessage,
  messageId: string,
  imitationId: string
) {
  if (!thread) {
    return;
  }
  if (thread.id === threadId) {
    return {
      ...thread,
      messages: [
        ...thread.messages.filter(
          ({ id }: any) => id !== imitationId && id !== messageId
        ),
        message,
      ],
    };
  }
  return thread;
}
