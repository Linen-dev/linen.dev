import {
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  SerializedAccount,
  UploadedFile,
  StartSignUpProps,
  SerializedTopic,
} from '@linen/types';
import { createThreadImitation } from '@linen/serializers/thread';
import { localStorage } from '@linen/utilities/storage';

export function createThreadWrapper({
  currentUser,
  allUsers,
  currentChannel,
  setUploads,
  setThreads,
  setTopics,
  currentCommunity,
  startSignUp,
  createThread,
  scroll,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  currentChannel: SerializedChannel;
  setUploads: any;
  setThreads: any;
  setTopics?: any;
  currentCommunity: SerializedAccount;
  startSignUp: (props: StartSignUpProps) => Promise<void>;
  createThread: any;
  scroll(): void;
}) {
  return async ({
    message,
    title,
    files,
    channelId,
  }: {
    message: string;
    title?: string;
    files: UploadedFile[];
    channelId: string;
  }) => {
    if (!currentUser) {
      localStorage.set('nouser.thread', {
        body: message,
        channelId,
      });
      startSignUp?.({
        communityId: currentCommunity.id,
      });
      return;
    }
    const imitation = createThreadImitation({
      message,
      title,
      mentions: allUsers,
      files,
      author: currentUser,
      channel: currentChannel,
    });
    setUploads([]);
    setThreads((threads: SerializedThread[]) => {
      return [...threads, imitation];
    });
    if (setTopics) {
      setTopics((topics: SerializedTopic[]) => {
        return [
          ...topics,
          {
            threadId: imitation.id,
            messageId: imitation.messages[0].id,
            sentAt: imitation.sentAt,
          },
        ];
      });
    }
    setTimeout(() => scroll(), 0);
    return createThread({
      body: message,
      title,
      files,
      accountId: currentCommunity.id,
      channelId,
      imitationId: imitation.id,
    }).then(
      ({
        thread,
        imitationId,
      }: {
        thread: SerializedThread;
        imitationId: string;
      }) => {
        setThreads((threads: SerializedThread[]) => {
          const threadId = thread.id;
          let index;
          index = threads.findIndex((thread) => thread.id === threadId);
          if (index >= 0) {
            return threads;
          }
          return [
            ...threads.filter((thread) => thread.id !== imitationId),
            thread,
          ];
        });
        if (setTopics) {
          setTopics((topics: SerializedTopic[]) => {
            return topics.map((topic) => {
              if (topic.threadId === imitationId) {
                return {
                  threadId: thread.id,
                  messageId: thread.messages[0].id,
                  sentAt: thread.sentAt,
                };
              }
              return topic;
            });
          });
        }
      }
    );
  };
}
