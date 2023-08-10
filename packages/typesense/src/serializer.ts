import { SerializedThread } from '@linen/types';
import { TypesenseThread } from './types';

export function serializer(thread: SerializedThread): TypesenseThread {
  return {
    author_name: thread.messages.at(0)?.author?.displayName!,
    body: thread.messages
      .map((m) => m.body)
      .filter((e) => !!e)
      .join('\n'),
    channel_name: thread.channel?.channelName!,
    created_at: Number(thread.sentAt),
    has_attachment: !!thread.messages.find((m) => m.attachments.length),
    increment_id: thread.incrementId,
    id: thread.id,
    last_reply_at: Number(thread.lastReplyAt),
    mentions_name: [
      ...new Set(
        thread.messages
          .map((m) => m.mentions.map((me) => me.displayName!).flat())
          .flat()
      ),
    ],
    // on disk
    thread: JSON.stringify(thread),
  };
}
