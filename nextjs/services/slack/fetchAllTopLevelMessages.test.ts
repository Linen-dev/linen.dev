import { prismaMock } from '../../__tests__/singleton';
import * as retryPromises from '../../utilities/retryPromises';
import * as s3Helper from '../aws/s3';
import * as fetch_all_conversations from 'fetch_all_conversations';
import { fetchAllTopLevelMessages } from './fetchAllTopLevelMessages';
import { conversationHistory } from '__mocks__/slack-api';

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
    const sleepMock = jest
      .spyOn(retryPromises, 'sleep')
      .mockResolvedValue(Promise.resolve());

    const threads = conversationHistory.messages
      .filter((t) => t.ts === t.thread_ts)
      .map(({ ts }) => {
        return { externalThreadId: ts, id: ts };
      });
    expect(threads.length).toBe(2);

    const messages = conversationHistory.messages
      .filter((t) => t.ts !== t.thread_ts)
      .map(({ ts }) => {
        return { externalThreadId: ts };
      });

    expect(messages.length).toBe(2);

    const fetchConversationsTypedMock = jest
      .spyOn(fetch_all_conversations, 'fetchConversationsTyped')
      .mockResolvedValue(conversationHistory);

    const threadsUpsertMock = prismaMock.threads.upsert.mockResolvedValue();
    prismaMock.$transaction.mockResolvedValue(threads);

    const messagesUpsertMock = prismaMock.messages.upsert
      .mockResolvedValueOnce(messages[0])
      .mockResolvedValueOnce(messages[1]);

    const messageReactionsUpsertMock =
      prismaMock.messageReactions.upsert.mockResolvedValue();
    const messageAttachmentsUpsertMock =
      prismaMock.messageAttachments.upsert.mockResolvedValue();
    const fetchFileSpy = jest.spyOn(fetch_all_conversations, 'fetchFile');
    const uploadFileSpy = jest.spyOn(s3Helper, 'uploadFile');
    const channelsUpdateMock = prismaMock.channels.update.mockResolvedValue();

    await fetchAllTopLevelMessages({
      channels: [internalChannel],
      account,
      usersInDb: [],
      token: account.slackAuthorizations[0].accessToken,
    });

    expect(fetchConversationsTypedMock).toHaveBeenCalledTimes(1);
    expect(fetchConversationsTypedMock).toHaveBeenNthCalledWith(
      1,
      externalChannel.id,
      account.slackAuthorizations[0].accessToken,
      undefined
    );

    expect(threadsUpsertMock).toHaveBeenCalledTimes(2);
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(1, {
      create: {
        channelId: internalChannel.id,
        externalThreadId: threads[0].externalThreadId,
      },
      update: {},
      where: {
        externalThreadId: threads[0].externalThreadId,
      },
    });
    expect(threadsUpsertMock).toHaveBeenNthCalledWith(2, {
      create: {
        channelId: internalChannel.id,
        externalThreadId: threads[1].externalThreadId,
      },
      update: {},
      where: {
        externalThreadId: threads[1].externalThreadId,
      },
    });

    expect(messagesUpsertMock).toHaveBeenCalledTimes(4);
    const sentAt1 = new Date(
      parseFloat(conversationHistory.messages[0].ts) * 1000
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(1, {
      create: {
        blocks: [],
        body: conversationHistory.messages[0].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[0].ts,
        mentions: {
          create: [],
        },
        sentAt: sentAt1,
        threadId: threads[0].id,
        usersId: undefined,
      },
      update: {
        blocks: [],
        body: conversationHistory.messages[0].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[0].ts,
        sentAt: sentAt1,
        threadId: threads[0].id,
        usersId: undefined,
      },
      where: {
        channelId_externalMessageId: {
          channelId: internalChannel.id,
          externalMessageId: conversationHistory.messages[0].ts,
        },
      },
    });
    const sentAt2 = new Date(
      parseFloat(conversationHistory.messages[1].ts) * 1000
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(2, {
      create: {
        blocks: [],
        body: conversationHistory.messages[1].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[1].ts,
        mentions: {
          create: [],
        },
        sentAt: sentAt2,
        threadId: threads[1].id,
        usersId: undefined,
      },
      update: {
        blocks: [],
        body: conversationHistory.messages[1].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[1].ts,
        sentAt: sentAt2,
        threadId: threads[1].id,
        usersId: undefined,
      },
      where: {
        channelId_externalMessageId: {
          channelId: internalChannel.id,
          externalMessageId: conversationHistory.messages[1].ts,
        },
      },
    });
    const sentAt3 = new Date(
      parseFloat(conversationHistory.messages[2].ts) * 1000
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(3, {
      create: {
        blocks: [],
        body: conversationHistory.messages[2].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[2].ts,
        mentions: {
          create: [],
        },
        sentAt: sentAt3,
        threadId: undefined,
        usersId: undefined,
      },
      update: {
        blocks: [],
        body: conversationHistory.messages[2].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[2].ts,
        sentAt: sentAt3,
        threadId: undefined,
        usersId: undefined,
      },
      where: {
        channelId_externalMessageId: {
          channelId: internalChannel.id,
          externalMessageId: conversationHistory.messages[2].ts,
        },
      },
    });
    const sentAt4 = new Date(
      parseFloat(conversationHistory.messages[3].ts) * 1000
    );
    expect(messagesUpsertMock).toHaveBeenNthCalledWith(4, {
      create: {
        blocks: [],
        body: conversationHistory.messages[3].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[3].ts,
        mentions: {
          create: [],
        },
        sentAt: sentAt4,
        threadId: undefined,
        usersId: undefined,
      },
      update: {
        blocks: [],
        body: conversationHistory.messages[3].text,
        channelId: internalChannel.id,
        externalMessageId: conversationHistory.messages[3].ts,
        sentAt: sentAt4,
        threadId: undefined,
        usersId: undefined,
      },
      where: {
        channelId_externalMessageId: {
          channelId: internalChannel.id,
          externalMessageId: conversationHistory.messages[3].ts,
        },
      },
    });

    expect(sleepMock).toHaveBeenCalledTimes(0);
    expect(messageReactionsUpsertMock).toHaveBeenCalledTimes(0);
    expect(messageAttachmentsUpsertMock).toHaveBeenCalledTimes(0);
    expect(fetchFileSpy).toHaveBeenCalledTimes(0);
    expect(uploadFileSpy).toHaveBeenCalledTimes(0);

    expect(channelsUpdateMock).toHaveBeenNthCalledWith(1, {
      data: {
        externalPageCursor: 'completed',
      },
      where: {
        id: internalChannel.id,
      },
    });
  });
});
