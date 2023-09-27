import { ChannelType, mentions, users } from '@linen/database';
import {
  createLlmQuestionTask,
  createNotificationJob,
  createTwoWaySyncJob,
  createTypesenseOnThreadCreation,
} from 'queue/jobs';
import { resolvePush } from 'services/push';
import { eventNewMentions } from './eventNewMentions';
import ChannelsService from 'services/channels';
import { matrixNewThread } from 'services/matrix';
import { MentionNode, channelsIntegrationType } from '@linen/types';
import { findOrCreateLinenBot } from 'services/users/findOrCreateLinenBot';
import AccountsService from 'services/accounts';

type NewThreadEvent = {
  channelId: any;
  threadId: any;
  messageId: any;
  imitationId: string;
  mentions: (mentions & {
    users: users | null;
  })[];
  mentionNodes: MentionNode[];
  communityId: string;
  thread: string;
  userId?: string;
  isLinenMessage: boolean;
};

export async function eventNewThread({
  channelId,
  messageId,
  threadId,
  imitationId,
  mentions = [],
  mentionNodes = [],
  communityId,
  thread,
  userId,
  isLinenMessage,
}: NewThreadEvent) {
  const event = {
    channelId,
    messageId,
    threadId,
    imitationId,
    isThread: true,
    isReply: false,
    thread,
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
        createTwoWaySyncJob({ ...event, event: 'newThread', id: messageId }),
        matrixNewThread(event),
      ]
    );
    if (channel?.type === ChannelType.DM) {
      promises.push(
        ChannelsService.unarchiveChannel({ channelId: channel.id })
      );
    }

    const llm = channel?.channelsIntegration.find(
      (ci) => ci.type === channelsIntegrationType.LLM
    );
    if (channel?.accountId && llm?.data) {
      const { communityName } = llm.data as any; // hack to allow us using another account on linenhq
      const bot = await findOrCreateLinenBot(channel.accountId);
      promises.push(
        createLlmQuestionTask({
          accountId: channel.accountId,
          authorId: bot.id,
          channelId,
          threadId,
          communityName,
        })
      );
    }
  }

  const account = await AccountsService.getAccountByThreadId(threadId);
  if (!!account?.searchSettings && threadId) {
    promises.push(
      createTypesenseOnThreadCreation({
        threadId,
        accountId: account.id,
      })
    );
  }

  await Promise.allSettled(promises);
}
