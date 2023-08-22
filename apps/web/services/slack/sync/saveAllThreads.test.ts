jest.mock('services/slack/api');
jest.mock('services/aws/s3');
import { conversationHistory, conversationReplies } from '__mocks__/slack-api';
import * as fetch_all_conversations from 'services/slack/api';
import * as s3Helper from 'services/aws/s3';
import { saveAllThreads } from './saveAllThreads';
import { prisma } from '@linen/database';
import { v4 } from 'uuid';

function generateRandomDate(from = new Date(0), to = new Date()) {
  return from.getTime() + Math.random() * (to.getTime() - from.getTime());
}

describe('slackSync :: saveAllThreads', () => {
  test('saveAllThreads', async () => {
    const history: typeof conversationHistory = JSON.parse(
      JSON.stringify(conversationHistory)
    );
    const ts1 = Number(history.messages[0].thread_ts);
    history.messages[0].thread_ts = generateRandomDate().toString();
    const ts2 = Number(history.messages[1].thread_ts);
    history.messages[1].thread_ts = generateRandomDate().toString();

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
            threads: {
              createMany: {
                data: [
                  {
                    sentAt: new Date(ts1).getTime(),
                    externalThreadId: history.messages[0].thread_ts,
                    messageCount: 2,
                  },
                  {
                    sentAt: new Date(ts2).getTime(),
                    externalThreadId: history.messages[1].thread_ts,
                    messageCount: 2,
                  },
                ],
              },
            },
          },
        },
      },
    });

    const fetchConversationsTypedMock = jest
      .spyOn(fetch_all_conversations, 'fetchReplies')
      .mockResolvedValueOnce({
        body: {
          ...conversationReplies,
          messages: conversationReplies.messages.map((m) => {
            m.thread_ts = history.messages[0].thread_ts!;
            return m;
          }),
        },
      } as any)
      .mockResolvedValueOnce({
        body: { ok: true, has_more: false, messages: [] },
      } as any);

    const fetchFileSpy = jest.spyOn(fetch_all_conversations, 'fetchFile');
    const uploadFileSpy = jest.spyOn(s3Helper, 'uploadFile');

    await saveAllThreads({
      channel: account.channels[0],
      usersInDb: [],
      token: account.slackAuthorizations[0].accessToken,
      fetchReplies: fetch_all_conversations.fetchReplies,
      logger: console as any,
    });

    const check = await prisma.channels.findUnique({
      where: { id: account.channels[0].id },
      select: {
        _count: {
          select: { messages: true, threads: true },
        },
      },
    });
    expect(check?._count.messages).toBe(4);
    expect(check?._count.threads).toBe(2);

    const thread = await prisma.threads.findFirst({
      where: {
        channelId: account.channels[0].id,
        externalThreadId: history.messages[0].thread_ts,
      },
      select: {
        _count: {
          select: { messages: true },
        },
      },
    });
    expect(thread?._count.messages).toBe(4);

    const thread2 = await prisma.threads.findFirst({
      where: {
        channelId: account.channels[0].id,
        externalThreadId: history.messages[1].thread_ts,
      },
      select: {
        _count: {
          select: { messages: true },
        },
      },
    });
    expect(thread2?._count.messages).toBe(0);

    expect(fetchConversationsTypedMock).toHaveBeenNthCalledWith(
      1,
      history.messages[1].thread_ts,
      account.channels[0].externalChannelId,
      account.slackAuthorizations[0].accessToken
    );
    expect(fetchConversationsTypedMock).toHaveBeenNthCalledWith(
      2,
      history.messages[0].thread_ts,
      account.channels[0].externalChannelId,
      account.slackAuthorizations[0].accessToken
    );

    expect(fetchFileSpy).toHaveBeenCalledTimes(0);
    expect(uploadFileSpy).toHaveBeenCalledTimes(0);
  });
});
