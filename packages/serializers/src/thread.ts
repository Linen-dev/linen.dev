import { serializeMessage } from './message';
import { serializeChannel } from './channel';
import {
  SerializedMessage,
  SerializedThread,
  MessageForSerialization,
} from '@linen/types';

function serializeMessages(
  messages?: MessageForSerialization[]
): SerializedMessage[] {
  if (!messages) {
    return [];
  }
  return messages.map(serializeMessage);
}

export function serializeThread({
  closeAt,
  firstManagerReplyAt,
  firstUserReplyAt,
  ...thread
}: any): SerializedThread {
  return {
    ...thread,
    sentAt: thread.sentAt.toString(),
    lastReplyAt: thread.lastReplyAt?.toString() || thread.sentAt.toString(),
    channel: thread.channel ? serializeChannel(thread.channel) : null,
    messages: serializeMessages(thread.messages),
  };
}
