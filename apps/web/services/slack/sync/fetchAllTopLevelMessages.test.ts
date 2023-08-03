jest.mock('services/slack/api');
jest.mock('services/aws/s3');

import { prismaMock } from '__tests__/singleton';
import * as s3Helper from 'services/aws/s3';
import * as fetch_all_conversations from 'services/slack/api';
import { fetchAllTopLevelMessages } from './fetchAllTopLevelMessages';
import { conversationHistory } from '__mocks__/slack-api';
import { parseSlackSentAt, tsToSentAt } from '@linen/serializers/sentAt';
import { slugify } from '@linen/utilities/string';
import { MessageFormat } from '@linen/types';

const account = {
  id: 'accountId123',
  slackTeamId: 'slackTeamId123',
  slackAuthorizations: [{ accessToken: 'token123' }],
};

const externalChannel = {
  id: 'slackId123',
  name: 'randomName',
  slackTeamId: 'slackTeamId123',
};

const internalChannel = {
  id: 'uuid123',
  channelName: externalChannel.name,
  externalPageCursor: null,
  externalChannelId: externalChannel.id,
};

describe('slackSync :: fetchAllTopLevelMessages', () => {
  // this function fetch messages only from channels thats hasn't "completed" as sync status
  // it upsert threads and messages, including reactions + attachments

  // we may persist the latest cursor instead of "completed",
  // so next run could continue from the cursor

  // pending: mentions, reactions and attachments
  test('fetchAllTopLevelMessages', async () => {
    const allMessages = conversationHistory.messages.map(({ ts }) => {
      return { externalThreadId: ts, id: ts };
    });

    const fetchConversationsTypedMock = jest
      .spyOn(fetch_all_conversations, 'fetchConversationsTyped')
      .mockResolvedValue(conversationHistory);

    const threadsUpsertMock = prismaMock.threads.upsert
      .mockResolvedValueOnce(allMessages[0])
      .mockResolvedValueOnce(allMessages[1])
      .mockResolvedValueOnce(allMessages[2])
      .mockResolvedValueOnce(allMessages[3]);

    const messagesUpsertMock = prismaMock.messages.upsert
      .mockResolvedValueOnce(allMessages[0])
      .mockResolvedValueOnce(allMessages[1])
      .mockResolvedValueOnce(allMessages[2])
      .mockResolvedValueOnce(allMessages[3]);

    const messageReactionsUpsertMock =
      prismaMock.messageReactions.upsert.mockResolvedValue();
    const messageAttachmentsUpsertMock =
      prismaMock.messageAttachments.upsert.mockResolvedValue();
    const fetchFileSpy = jest.spyOn(fetch_all_conversations, 'fetchFile');
    const uploadFileSpy = jest.spyOn(s3Helper, 'uploadFile');
    const channelsUpdateMock = prismaMock.channels.update.mockResolvedValue();

    await fetchAllTopLevelMessages({
      channel: internalChannel,
      account,
      usersInDb: [],
      token: account.slackAuthorizations[0].accessToken,
      fetchConversationsTyped: fetch_all_conversations.fetchConversationsTyped,
      logger: console,
    });

    expect(fetchConversationsTypedMock).toHaveBeenCalledTimes(1);
    expect(fetchConversationsTypedMock).toHaveBeenNthCalledWith(
      1,
      externalChannel.id,
      account.slackAuthorizations[0].accessToken,
      undefined,
      undefined
    );

    const upsertBuilder = (index: number) => ({
      create: {
        channelId: internalChannel.id,
        externalThreadId: conversationHistory.messages[index].ts,
        sentAt: parseSlackSentAt(conversationHistory.messages[index].ts),
        lastReplyAt: parseSlackSentAt(conversationHistory.messages[index].ts),
        slug: slugify(conversationHistory.messages[index].text),
        messageCount:
          (conversationHistory.messages[index]?.reply_count || 0) + 1,
      },
      update: {},
      where: {
        externalThreadId: conversationHistory.messages[index].ts,
      },
      include: { messages: true },
    });
    expect(threadsUpsertMock).toHaveBeenCalledTimes(4);
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(1, upsertBuilder(0));
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(2, upsertBuilder(1));
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(3, upsertBuilder(2));
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(4, upsertBuilder(3));

    expect(messagesUpsertMock).toHaveBeenCalledTimes(4);

    const messageUpsertBuilder = (index: number) => ({
      create: {
        body: conversationHistory.messages[index].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[index].ts,
        mentions: {
          create: [],
        },
        sentAt: tsToSentAt(conversationHistory.messages[index].ts),
        threadId: allMessages[index].id,
        usersId: undefined,
        messageFormat: MessageFormat.SLACK,
      },
      update: {
        body: conversationHistory.messages[index].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[index].ts,
        sentAt: tsToSentAt(conversationHistory.messages[index].ts),
        threadId: allMessages[index].id,
        usersId: undefined,
        messageFormat: MessageFormat.SLACK,
      },
      where: {
        channelId_externalMessageId: {
          channelId: internalChannel.id,
          externalMessageId: conversationHistory.messages[index].ts,
        },
      },
    });
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      1,
      messageUpsertBuilder(0)
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      2,
      messageUpsertBuilder(1)
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      3,
      messageUpsertBuilder(2)
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(
      4,
      messageUpsertBuilder(3)
    );

    expect(messageReactionsUpsertMock).toHaveBeenCalledTimes(0);
    expect(messageAttachmentsUpsertMock).toHaveBeenCalledTimes(0);
    expect(fetchFileSpy).toHaveBeenCalledTimes(0);
    expect(uploadFileSpy).toHaveBeenCalledTimes(0);

    expect(channelsUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        externalPageCursor: '{"channelCursor":"completed"}',
      },
      where: {
        id: internalChannel.id,
      },
    });
  });
});
