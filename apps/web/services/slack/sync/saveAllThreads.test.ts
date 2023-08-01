jest.mock('services/slack/api');
jest.mock('services/aws/s3');

import { prismaMock } from '__tests__/singleton';
import { conversationHistory, conversationReplies } from '__mocks__/slack-api';
import * as fetch_all_conversations from 'services/slack/api';
import * as s3Helper from 'services/aws/s3';
import { saveAllThreads } from './saveAllThreads';
import { slugify } from '@linen/utilities/string';
import { parseSlackSentAt } from '@linen/serializers/sentAt';
import { MessageFormat } from '@linen/types';

const account = {
  id: 'accountId123',
  slackTeamId: 'slackTeamId123',
  slackAuthorizations: [{ accessToken: 'token123' }],
};

const externalChannel = {
  id: 'slackId123',
  name: 'randomName',
  slackTeamId: account.slackTeamId,
};

const internalChannel = {
  id: 'uuid123',
  channelName: externalChannel.name,
  externalPageCursor: null,
  externalChannelId: externalChannel.id,
};

const externalChannel2 = {
  id: 'slackId234',
  name: 'randomName2',
  slackTeamId: account.slackTeamId,
};

describe('slackSync :: saveAllThreads', () => {
  test('saveAllThreads', async () => {
    const threads = conversationHistory.messages
      .filter((t) => t.ts === t.thread_ts)
      .map(({ ts }) => {
        return { externalThreadId: ts, id: ts, channelId: internalChannel.id };
      });
    expect(threads.length).toBe(2);

    const findThreadsWithOnlyOneMessageMock = prismaMock.threads.findMany
      .mockResolvedValueOnce(threads)
      .mockResolvedValueOnce();

    const fetchConversationsTypedMock = jest
      .spyOn(fetch_all_conversations, 'fetchReplies')
      .mockResolvedValueOnce({
        body: conversationReplies,
      } as any)
      .mockResolvedValueOnce({
        body: { ok: true, has_more: false, messages: [] },
      } as any);

    const threadsUpsertMock = prismaMock.threads.upsert.mockResolvedValue({});
    const threadsUpdateMock = prismaMock.threads.update.mockResolvedValue({});

    const messageBuilder = (index: number) => ({ id: `messageId${index}` });

    const messagesUpsertMock = prismaMock.messages.upsert
      .mockResolvedValueOnce(messageBuilder(0))
      .mockResolvedValueOnce(messageBuilder(1))
      .mockResolvedValueOnce(messageBuilder(2))
      .mockResolvedValueOnce(messageBuilder(3));
    const messageReactionsUpsertMock =
      prismaMock.messageReactions.upsert.mockResolvedValue();
    const messageAttachmentsUpsertMock =
      prismaMock.messageAttachments.upsert.mockResolvedValue();
    const fetchFileSpy = jest.spyOn(fetch_all_conversations, 'fetchFile');
    const uploadFileSpy = jest.spyOn(s3Helper, 'uploadFile');

    await saveAllThreads({
      channel: internalChannel,
      usersInDb: [],
      token: account.slackAuthorizations[0].accessToken,
      fetchReplies: fetch_all_conversations.fetchReplies,
      logger: console,
    });

    expect(findThreadsWithOnlyOneMessageMock).toBeCalledTimes(2);

    expect(fetchConversationsTypedMock).toBeCalledTimes(2);
    expect(fetchConversationsTypedMock).toHaveBeenNthCalledWith(
      1,
      threads[0].id,
      externalChannel.id,
      account.slackAuthorizations[0].accessToken
    );
    expect(fetchConversationsTypedMock).toHaveBeenNthCalledWith(
      2,
      threads[1].id,
      externalChannel.id,
      account.slackAuthorizations[0].accessToken
    );

    expect(threadsUpdateMock).toBeCalledTimes(1);
    expect(threadsUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        messageCount: conversationReplies.messages.length,
        slug: slugify(conversationReplies.messages[0].text),
      },
      where: {
        externalThreadId: threads[0].id,
      },
    });

    expect(threadsUpsertMock).toBeCalledTimes(4);
    const upsertThread = (index: number) => ({
      create: {
        channelId: internalChannel.id,
        externalThreadId: threads[0].id,
        sentAt: parseSlackSentAt(threads[0].externalThreadId),
        lastReplyAt: parseSlackSentAt(threads[0].externalThreadId),
        slug: slugify(conversationReplies.messages[index].text),
      },
      include: {
        messages: true,
      },
      update: {},
      where: {
        externalThreadId: threads[0].id,
      },
    });
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(1, upsertThread(0));
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(2, upsertThread(1));
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(3, upsertThread(2));
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(4, upsertThread(3));

    const messageInsertBuilder = (index: number) => ({
      create: {
        body: conversationReplies.messages[index].text,
        externalMessageId: conversationReplies.messages[index].ts,
        channelId: internalChannel.id,
        mentions: { create: [] },
        sentAt: expect.any(Date),
        threadId: undefined,
        usersId: undefined,
        messageFormat: MessageFormat.SLACK,
      },
      update: {
        body: conversationReplies.messages[index].text,
        externalMessageId: conversationReplies.messages[index].ts,
        channelId: internalChannel.id,
        sentAt: expect.any(Date),
        threadId: undefined,
        usersId: undefined,
        messageFormat: MessageFormat.SLACK,
      },
      where: {
        channelId_externalMessageId: {
          externalMessageId: conversationReplies.messages[index].ts,
          channelId: internalChannel.id,
        },
      },
    });
    expect(messagesUpsertMock).toBeCalledTimes(4);
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      1,
      messageInsertBuilder(0)
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      2,
      messageInsertBuilder(1)
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      3,
      messageInsertBuilder(2)
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      4,
      messageInsertBuilder(3)
    );

    expect(messageReactionsUpsertMock).toHaveBeenCalledTimes(2);

    const reactionInsertBuildMock = (index: number) => ({
      create: {
        count: 1,
        messagesId: messageBuilder(index).id,
        name: conversationReplies.messages[index].reactions?.[0].name,
        users: conversationReplies.messages[index].reactions?.[0].users,
      },
      update: {
        count: 1,
        messagesId: messageBuilder(index).id,
        name: conversationReplies.messages[index].reactions?.[0].name,
        users: conversationReplies.messages[index].reactions?.[0].users,
      },
      where: {
        messagesId_name: {
          messagesId: messageBuilder(index).id,
          name: conversationReplies.messages[index].reactions?.[0].name,
        },
      },
    });
    expect(messageReactionsUpsertMock).toHaveBeenNthCalledWith(
      1,
      reactionInsertBuildMock(0)
    );
    expect(messageReactionsUpsertMock).toHaveBeenNthCalledWith(
      2,
      reactionInsertBuildMock(3)
    );

    expect(messageAttachmentsUpsertMock).toHaveBeenCalledTimes(0);
    expect(fetchFileSpy).toHaveBeenCalledTimes(0);
    expect(uploadFileSpy).toHaveBeenCalledTimes(0);
  });
});
