import { testApiHandler } from 'next-test-api-route-handler';

import { prismaMock } from '../../singleton';

import * as mockModels from '../../../lib/models';
jest.mock('../../../lib/models', () => ({
  ...jest.requireActual('../../../lib/models'),
  findOrCreateUserFromUserInfo: jest.fn(),
}));

import handler from '../../../pages/api/webhook';

const addMessageEvent = {
  token: 'RudepRJuMOjy8zENRCLdXW7t',
  team_id: 'T036DSF9RJT',
  api_app_id: 'A03CA2AHMAL',
  event: {
    client_msg_id: '4fa352fb-f83c-4401-aaa3-7b062737b00d',
    type: 'message',
    text: 'this is test3',
    user: 'U037T5JG1NY',
    ts: '1650644364.126099',
    team: 'T036DSF9RJT',
    blocks: [{ type: 'rich_text', block_id: '9hC', elements: [Array] }],
    channel: 'C03ATK7RWNS',
    event_ts: '1650644364.126099',
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: 'Ev03DDKEJ2DN',
  event_time: 1650805199,
  authorizations: [[Object]],
  is_ext_shared_channel: false,
  event_context:
    '4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDM2RFNGOVJKVCIsImFpZCI6IkEwM0NBMkFITUFMIiwiY2lkIjoiQzAzQVRLN1JXTlMifQ',
};

const deleteMessageEvent = {
  type: 'message',
  subtype: 'message_deleted',
  previous_message: {
    client_msg_id: 'c09833d7-056b-4ee6-9b43-6d4194f9fa46',
    type: 'message',
    text: 'testing more',
    user: 'U037T5JG1NY',
    ts: '1650483492.673849',
    team: 'T036DSF9RJT',
    blocks: [[Object]],
  },
  channel: 'C03ATK7RWNS',
  hidden: true,
  deleted_ts: '1650483492.673849',
  event_ts: '1650483598.001300',
  ts: '1650483598.001300',
  channel_type: 'channel',
};

describe('webhook', () => {
  // let consoleWarnSpy: jest.SpyInstance;
  // let consoleLogSpy: jest.SpyInstance;
  // let consoleDebugSpy: jest.SpyInstance;
  // let consoleErrorSpy: jest.SpyInstance;
  //
  // beforeAll(() => {
  //     consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  //     consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  //     consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  //     consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  // });
  //
  // afterAll(() => {
  //     consoleWarnSpy.mockRestore();
  //     consoleLogSpy.mockRestore();
  //     consoleDebugSpy.mockRestore();
  //     consoleErrorSpy.mockRestore();
  // });

  it('add message - channel not found', async () => {
    prismaMock.channels.findUnique.mockResolvedValue(null);

    await testApiHandler({
      handler,
      url: '/api/webhook',
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(addMessageEvent),
        });
        expect(res.status).toBe(403);
        await expect(res.json()).resolves.toStrictEqual({
          error: 'Channel not found',
        });
      },
    });
  });

  it('add message - new thread', async () => {
    const channelMock = {
      id: 'channel_id',
      channelName: 'channel_name',
      slackChannelId: 'C03ATK7RWNS',
      accountId: 'account_id',
      hidden: false,
      slackNextPageCursor: null,
    };
    const channelsFindUniqueMock =
      prismaMock.channels.findUnique.mockResolvedValue(channelMock);

    const threadMock = {
      id: 'thread_id',
      incrementId: 0,
      slackThreadTs: 'string',
      viewCount: 0,
      slug: null,
      messageCount: 0,
      channelId: 'C03ATK7RWNS',
    };
    const slackThreadsUpsertMock =
      prismaMock.slackThreads.upsert.mockResolvedValue(threadMock);

    const userMock = {
      id: 'user_id',
      slackUserId: 'U037T5JG1NY',
      displayName: 'Jhon Smith',
      profileImageUrl: null,
      isBot: false,
      isAdmin: false,
      accountsId: 'account_id',
    };
    mockModels.findOrCreateUserFromUserInfo.mockResolvedValue(userMock);

    const now = new Date();
    const messageMock = {
      id: 'message_id',
      createdAt: now,
      body: 'this is test3',
      sentAt: now,
      channelId: 'C03ATK7RWNS',
      slackMessageId: '1650644364.126099',
      slackThreadId: null,
      usersId: 'user_id',
    };
    const messagesCreateMock =
      prismaMock.messages.create.mockResolvedValue(messageMock);

    await testApiHandler({
      handler,
      url: '/api/webhook',
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(addMessageEvent),
        });

        // Proper channel has been searched for based on Slack event
        expect(channelsFindUniqueMock).toHaveBeenCalledWith({
          where: {
            slackChannelId: addMessageEvent.event.channel,
          },
          include: {
            account: {
              include: {
                slackAuthorizations: true,
              },
            },
          },
        });

        // Proper thread was created/updated
        expect(slackThreadsUpsertMock).toHaveBeenCalledWith({
          where: {
            slackThreadTs: addMessageEvent.event.ts,
          },
          update: {},
          create: {
            slackThreadTs: addMessageEvent.event.ts,
            channelId: channelMock.id,
          },
          include: {
            messages: true,
          },
        });

        // Slug for new threadd created
        expect(threadMock.slug).toEqual('this-is-test3');
        prismaMock.slackThreads.update.calledWith({
          where: {
            id: threadMock.id,
          },
          data: threadMock,
        });

        expect(mockModels.findOrCreateUserFromUserInfo).toHaveBeenCalledWith(
          addMessageEvent.event.user,
          channelMock
        );

        expect(messagesCreateMock).toHaveBeenCalledWith({
          data: {
            body: 'this is test3',
            slackThreadId: 'thread_id',
            slackMessageId: '1650644364.126099',
            channelId: 'channel_id',
            sentAt: new Date(parseFloat(addMessageEvent.event.ts) * 1000),
            usersId: 'user_id',
            mentions: {
              create: [],
            },
          },
        });

        // result OK:200
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({});
      },
    });
  });
});
