jest.mock('services/slack/api');
jest.mock('services/aws/s3');

import * as fetch_all_conversations from 'services/slack/api';
import { fetchAllTopLevelMessages } from './fetchAllTopLevelMessages';
import { conversationHistory } from '__mocks__/slack-api';
import { v4 } from 'uuid';
import { prisma } from '@linen/database';

describe('slackSync :: fetchAllTopLevelMessages', () => {
  // this function fetch messages only from channels thats hasn't "completed" as sync status
  // it upsert threads and messages, including reactions + attachments

  // we may persist the latest cursor instead of "completed",
  // so next run could continue from the cursor

  // pending: mentions, reactions and attachments
  test('fetchAllTopLevelMessages', async () => {
    const account = await prisma.accounts.create({
      include: { slackAuthorizations: true, channels: true },
      data: {
        slackTeamId: v4(),
        slackAuthorizations: {
          create: {
            accessToken: v4(),
            botUserId: v4(),
            scope: v4(),
          },
        },
        channels: {
          create: {
            channelName: v4(),
            externalChannelId: v4(),
          },
        },
      },
    });

    jest
      .spyOn(fetch_all_conversations, 'fetchConversationsTyped')
      .mockResolvedValue(conversationHistory);

    await fetchAllTopLevelMessages({
      channel: account.channels[0],
      account,
      usersInDb: [],
      token: account.slackAuthorizations[0].accessToken,
      fetchConversationsTyped: fetch_all_conversations.fetchConversationsTyped,
      logger: console,
    });

    const channel = await prisma.channels.findUnique({
      select: {
        _count: { select: { threads: true, messages: true } },
        externalPageCursor: true,
      },
      where: { id: account.channels[0].id },
    });
    expect(channel?.externalPageCursor).toBe('{"channelCursor":"completed"}');
    expect(channel?._count.messages).toBe(4);
    expect(channel?._count.threads).toBe(4);
  });
});
