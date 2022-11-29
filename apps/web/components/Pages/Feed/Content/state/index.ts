import {
  Scope,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import { FeedResponse } from '../../types';

export function prependThread(
  thread: SerializedThread,
  message?: SerializedMessage
) {
  return (feed: FeedResponse) => {
    const { threads, ...rest } = feed;
    if (message) {
      thread.messages = [
        ...thread.messages.filter((m) => m.id !== message.id),
        message,
      ];
    }
    return {
      ...rest,
      threads: [thread, ...threads.filter((t) => t.id !== thread.id)],
    };
  };
}

export function filterByScope(
  scope: Scope,
  messages: SerializedMessage[],
  currentUser?: SerializedUser
) {
  return (
    scope === Scope.Participant &&
    !messages.find(
      (m) =>
        m.author?.id === currentUser?.id ||
        m.mentions.find((me) => me.id === currentUser?.id)
    )
  );
}
