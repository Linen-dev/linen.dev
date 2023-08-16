import { SerializedThread } from '@linen/types';
import { TypesenseThread } from './types';

export function serializer({
  thread,
  is_public,
  is_restrict,
  accessible_to,
}: {
  thread: SerializedThread;
  is_public: boolean;
  is_restrict: boolean;
  accessible_to: string[];
}): TypesenseThread {
  return {
    author_name: thread.messages.at(0)?.author?.displayName!,
    body: thread.messages
      .map((m) => m.body)
      .filter((e) => !!e)
      .join('\n'),
    channel_name: thread.channel?.channelName!,
    id: thread.id,
    last_reply_at: Number(thread.lastReplyAt),
    mentions_name: [
      ...new Set(
        thread.messages
          .map((m) => m.mentions.map((me) => me.displayName!).flat())
          .flat()
      ),
    ],
    accountId: thread.channel?.accountId!,
    is_public,
    accessible_to,
    is_restrict,
    // on disk
    thread: JSON.stringify(thread),
  };
}
