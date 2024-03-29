import { ChannelType, mentions, users } from '@linen/database';
import {
  createNotificationJob,
  createTwoWaySyncJob,
  createTypesenseOnMessageCreation,
} from 'queue/jobs';
import { resolvePush } from 'services/push';
import ThreadsServices from 'services/threads';
import UserThreadStatusService from 'services/user-thread-status';
import { eventNewMentions } from 'services/events/eventNewMentions';
import ChannelsService from 'services/channels';
import { matrixNewMessage } from 'services/matrix';
import { MentionNode } from '@linen/types';
import AccountsService from 'services/accounts';

export type NewMessageEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: (mentions & {
    users: users | null;
  })[];
  mentionNodes: MentionNode[];
  communityId: string;
  message: string;
  userId?: string;
  isLinenMessage: boolean;
};

export async function eventNewMessage({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
  mentionNodes = [],
  communityId,
  message,
  userId,
  isLinenMessage,
}: NewMessageEvent) {
  const event = {
    channelId,
    messageId,
    threadId,
    imitationId,
    isThread: false,
    isReply: true,
    message,
  };

  const channel = await ChannelsService.getChannelAndMembersWithAuth(channelId);

  const promises: Promise<any>[] = [
    eventNewMentions({
      mentions,
      mentionNodes,
      channelId,
      threadId,
      authorId: userId,
    }),
    ...resolvePush({ channel, userId, event, communityId }),
  ];

  if (isLinenMessage) {
    promises.push(
      ...[
        createNotificationJob(messageId, {
          ...event,
          communityId,
          mentions,
          mentionNodes,
        }),
        createTwoWaySyncJob({ ...event, event: 'newMessage', id: messageId }),
        matrixNewMessage(event),
        ThreadsServices.updateMetrics({ messageId, threadId }),
        UserThreadStatusService.markAsUnread(threadId, userId),
        UserThreadStatusService.markAsUnmutedForMentionedUsers(
          threadId,
          mentions.map((mention) => mention.usersId)
        ),
      ]
    );
    if (channel?.type === ChannelType.DM) {
      promises.push(
        ChannelsService.unarchiveChannel({ channelId: channel.id })
      );
    }
  }

  const account = await AccountsService.getAccountByThreadId(threadId);
  if (!!account?.searchSettings && threadId) {
    promises.push(
      createTypesenseOnMessageCreation({
        threadId,
        accountId: account.id,
      })
    );
  }

  await Promise.allSettled(promises);
}
