import {
  SerializedThread,
  SerializedUser,
  SerializedAccount,
  SerializedChannel,
} from '@linen/types';
import { createThreadImitation } from '@linen/serializers/thread';
import type { ApiClient } from '@linen/api-client';

export default function OnChannelDrop({
  threads,
  setThreads,
  currentCommunity,
  api,
  currentChannel,
  allUsers,
}: {
  threads: SerializedThread[];
  setThreads(threads: SerializedThread[]): void;
  currentCommunity: SerializedAccount;
  api: ApiClient;
  currentChannel: SerializedChannel;
  allUsers: SerializedUser[];
}) {
  const moveThreadToChannel = ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId: string;
  }) => {
    setThreads(
      threads.filter((thread) => {
        if (thread.id === threadId && thread.channelId !== channelId) {
          return false;
        }
        return true;
      })
    );

    return api.moveThreadToChannelRequest({
      threadId,
      channelId,
      communityId: currentCommunity.id,
    });
  };

  const moveMessageToChannel = ({
    messageId,
    channelId,
  }: {
    messageId: string;
    channelId: string;
  }) => {
    const messages = [...threads.map((thread) => thread.messages)].flat();
    const message = messages.find(({ id }) => id === messageId);
    if (!message) {
      return;
    }
    const imitation =
      currentChannel.id === channelId
        ? createThreadImitation({
            message: message.body,
            files: message.attachments.map((attachment) => {
              return {
                id: attachment.name,
                url: attachment.url,
              };
            }),
            author: message.author as SerializedUser,
            mentions: allUsers,
            channel: currentChannel,
          })
        : null;

    const result = threads.map((thread) => {
      const ids = thread.messages.map(({ id }) => id);
      if (ids.includes(messageId)) {
        return {
          ...thread,
          messages: thread.messages.filter(({ id }) => id !== messageId),
        };
      }

      return thread;
    });

    setThreads([...result, ...(imitation ? [imitation] : [])]);

    return api
      .moveMessageToChannelRequest({
        messageId,
        channelId,
        communityId: currentCommunity.id,
      })
      .then((thread: SerializedThread) => {
        setThreads(
          threads.map((current) => {
            if (current.id === imitation?.id) {
              return thread;
            }
            return current;
          })
        );
      });
  };

  return ({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }) => {
    if (source === 'thread' && target === 'channel') {
      return moveThreadToChannel({ threadId: from, channelId: to });
    } else if (source === 'message' && target === 'channel') {
      return moveMessageToChannel({ messageId: from, channelId: to });
    }
  };
}
