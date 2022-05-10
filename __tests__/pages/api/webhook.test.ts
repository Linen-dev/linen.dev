import { testApiHandler } from 'next-test-api-route-handler';

import { prismaMock } from '../../singleton';

import * as mockModels from '../../../lib/models';
jest.mock('../../../lib/models', () => ({
  ...jest.requireActual('../../../lib/models'),
  findOrCreateUserFromUserInfo: jest.fn(),
  findMessageByChannelIdAndTs: jest.fn(),
  deleteMessageWithMentions: jest.fn(),
}));

import handler from '../../../pages/api/webhook';
import { deleteMessageWithMentions } from '../../../lib/models';

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
  token: 'RudepRJuMOjy8zENRCLdXW7t',
  team_id: 'T036DSF9RJT',
  api_app_id: 'A03CA2AHMAL',
  event: {
    type: 'message',
    subtype: 'message_deleted',
    previous_message: {
      client_msg_id: '3ff2b5dd-787e-4762-b2f6-0b6cc15b97cd',
      type: 'message',
      text: 'yet another test',
      user: 'U037T5JG1NY',
      ts: '1651046601.602859',
      team: 'T036DSF9RJT',
      blocks: [Array],
    },
    channel: 'C03ATK7RWNS',
    hidden: true,
    deleted_ts: '1651046601.602859',
    event_ts: '1651046639.000300',
    ts: '1651046639.000300',
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: 'Ev03D3UYJSG3',
  event_time: 1651046639,
  authorizations: [
    {
      enterprise_id: null,
      team_id: 'T036DSF9RJT',
      user_id: 'U037T5JG1NY',
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    '4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDM2RFNGOVJKVCIsImFpZCI6IkEwM0NBMkFITUFMIiwiY2lkIjoiQzAzQVRLN1JXTlMifQ',
};

const changeMessageEvent = {
  token: 'RudepRJuMOjy8zENRCLdXW7t',
  team_id: 'T036DSF9RJT',
  api_app_id: 'A03CA2AHMAL',
  event: {
    type: 'message',
    subtype: 'message_changed',
    message: {
      client_msg_id: 'f9a0d446-a326-4f9d-a952-eb03bc2859f1',
      type: 'message',
      text: 'Lets test_4',
      user: 'U037T5JG1NY',
      team: 'T036DSF9RJT',
      edited: [Object],
      blocks: [Array],
      ts: '1652127600.388019',
      source_team: 'T036DSF9RJT',
      user_team: 'T036DSF9RJT',
    },
    previous_message: {
      client_msg_id: 'f9a0d446-a326-4f9d-a952-eb03bc2859f1',
      type: 'message',
      text: 'Lets test_4 witn mention <@U036UEMK143> again',
      user: 'U037T5JG1NY',
      ts: '1652127600.388019',
      team: 'T036DSF9RJT',
      blocks: [Array],
    },
    channel: 'C03ATK7RWNS',
    hidden: true,
    ts: '1652202460.000600',
    event_ts: '1652202460.000600',
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: 'Ev03ESDMQFM3',
  event_time: 1652202460,
  authorizations: [
    {
      enterprise_id: null,
      team_id: 'T036DSF9RJT',
      user_id: 'U037T5JG1NY',
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context:
    '4-eyJldCI6Im1lc3NhZ2UiLCJ0aWQiOiJUMDM2RFNGOVJKVCIsImFpZCI6IkEwM0NBMkFITUFMIiwiY2lkIjoiQzAzQVRLN1JXTlMifQ',
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

        // Slug for new thread created
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

  it('delete message', async () => {
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

    mockModels.findMessageByChannelIdAndTs.mockResolvedValue({
      id: 'message_id',
    });

    await testApiHandler({
      handler,
      url: '/api/webhook',
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(deleteMessageEvent),
        });

        // Proper channel has been searched for based on Slack event
        expect(channelsFindUniqueMock).toHaveBeenCalledWith({
          where: {
            slackChannelId: deleteMessageEvent.event.channel,
          },
          include: {
            account: {
              include: {
                slackAuthorizations: true,
              },
            },
          },
        });

        expect(mockModels.findMessageByChannelIdAndTs).toHaveBeenCalledWith(
          channelMock.id,
          deleteMessageEvent.event.deleted_ts
        );
        expect(mockModels.deleteMessageWithMentions).toHaveBeenCalledWith(
          'message_id'
        );

        // result OK:200
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toStrictEqual({});
      },
    });
  });

  it('change message', async () => {
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

    mockModels.findMessageByChannelIdAndTs.mockResolvedValue({
      id: 'message_id',
    });

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
      body: 'Lets-test-4',
      sentAt: now,
      channelId: 'C03ATK7RWNS',
      slackMessageId: '1652127600.388019',
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
          body: JSON.stringify(changeMessageEvent),
        });

        // Proper channel has been searched for based on Slack event
        expect(channelsFindUniqueMock).toHaveBeenCalledWith({
          where: {
            slackChannelId: changeMessageEvent.event.channel,
          },
          include: {
            account: {
              include: {
                slackAuthorizations: true,
              },
            },
          },
        });

        expect(mockModels.findMessageByChannelIdAndTs).toHaveBeenCalledWith(
          channelMock.id,
          changeMessageEvent.event.previous_message.ts
        );

        expect(mockModels.deleteMessageWithMentions).toHaveBeenCalledWith(
          'message_id'
        );

        // Proper channel has been searched for based on Slack event
        expect(channelsFindUniqueMock).toHaveBeenCalledWith({
          where: {
            slackChannelId: changeMessageEvent.event.channel,
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
            slackThreadTs: changeMessageEvent.event.message.ts,
          },
          update: {},
          create: {
            slackThreadTs: changeMessageEvent.event.message.ts,
            channelId: channelMock.id,
          },
          include: {
            messages: true,
          },
        });

        // Slug for new thread created
        expect(threadMock.slug).toEqual('Lets-test-4');
        prismaMock.slackThreads.update.calledWith({
          where: {
            id: threadMock.id,
          },
          data: threadMock,
        });

        expect(mockModels.findOrCreateUserFromUserInfo).toHaveBeenCalledWith(
          changeMessageEvent.event.message.user,
          channelMock
        );

        expect(messagesCreateMock).toHaveBeenCalledWith({
          data: {
            body: 'Lets test_4',
            slackThreadId: 'thread_id',
            slackMessageId: '1652127600.388019',
            channelId: 'channel_id',
            sentAt: new Date(
              parseFloat(changeMessageEvent.event.message.ts) * 1000
            ),
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
