import { MessageForSerialization } from '../types/partialTypes';
import serializeMessage, { SerializedMessage } from './message';

import type { channels, threads } from '@prisma/client';

interface SerializedChannel {
  channelName: string;
  hidden: boolean;
  default: boolean;
}

export interface SerializedThread extends Omit<threads, 'sentAt' | 'closeAt'> {
  id: string;
  sentAt: string;
  closeAt: string | null;
  messages: SerializedMessage[];
  channel: SerializedChannel | null;
}

type ThreadForSerialization = threads & {
  messages?: MessageForSerialization[];
  channel?: channels;
};

function serializeChannel(channel?: channels): SerializedChannel | null {
  if (!channel) {
    return null;
  }
  return {
    channelName: channel.channelName,
    hidden: channel.hidden,
    default: channel.default,
  };
}

function serializeMessages(
  messages?: MessageForSerialization[]
): SerializedMessage[] {
  if (!messages) {
    return [];
  }
  return messages.map(serializeMessage);
}

export default function serialize(
  thread: ThreadForSerialization
): SerializedThread {
  return {
    ...thread,
    sentAt: thread.sentAt.toString(),
    closeAt: thread.closeAt ? thread.closeAt.toString() : null,
    channel: serializeChannel(thread.channel),
    messages: serializeMessages(thread.messages),
  };
}
