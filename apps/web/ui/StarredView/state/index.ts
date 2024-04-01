import type { SerializedMessage, SerializedThread } from '@linen/types';

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
