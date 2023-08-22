jest.mock('services/users');
jest.mock('services/events/eventNewMessage');
jest.mock('services/events/eventNewThread');
import { handleWebhook } from 'services/slack/webhooks';
import { v4 } from 'uuid';
import { prisma } from '@linen/database';

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
    blocks: [{ type: 'rich_text', block_id: '9hC', elements: [] }],
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
      blocks: [{ type: 'rich_text', block_id: '9hC', elements: [] }],
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
      blocks: [{ type: 'rich_text', block_id: '9hC', elements: [] }],
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

describe.skip('webhook', () => {
  it('add message - new thread', async () => {
    const account = await prisma.accounts.create({
      data: {},
    });
    const channelMock = await prisma.channels.create({
      data: {
        channelName: v4(),
        externalChannelId: v4(),
        accountId: account.id,
        hidden: false,
      },
    });

    const res = await handleWebhook(
      {
        ...addMessageEvent,
        event: {
          ...addMessageEvent.event,
          channel: channelMock.externalChannelId!,
        },
      },
      console
    );
    // result OK:200
    expect(res.status).toBe(200);
    expect(res.message.body).toStrictEqual('this is test3');

    const message = await prisma.messages.findFirst({
      where: { externalMessageId: addMessageEvent.event.ts },
    });
    expect(message).toBeDefined();
    expect(message?.id).toBe(res.message.id);
    expect(message?.channelId).toBe(channelMock.id);

    const thread = await prisma.threads.findFirst({
      where: { id: message?.threadId! },
    });
    expect(thread).toBeDefined();
    expect(message?.externalMessageId).toBe(thread?.externalThreadId);
  });

  it('delete message', async () => {
    const message = await prisma.messages.create({
      include: { channel: true },
      data: {
        body: v4(),
        sentAt: new Date(),
        externalMessageId: v4(),
        channel: {
          create: {
            channelName: v4(),
            externalChannelId: v4(),
            account: { create: {} },
          },
        },
      },
    });

    const messageShouldExist = await prisma.messages.findUnique({
      where: { id: message.id },
    });
    expect(messageShouldExist).toBeDefined();

    const res = await handleWebhook(
      {
        ...deleteMessageEvent,
        event: {
          ...deleteMessageEvent.event,
          deleted_ts: message.externalMessageId!,
          channel: message.channel.externalChannelId!,
        },
      },
      console
    );

    const messageShouldNotExist = await prisma.messages.findUnique({
      where: { id: message.id },
    });
    expect(messageShouldNotExist).toBeNull();

    // result OK:200
    expect(res.status).toBe(200);
    expect(res.message).toStrictEqual({});
  });

  it('change message', async () => {
    const message = await prisma.messages.create({
      include: { channel: true },
      data: {
        body: v4(),
        sentAt: new Date(),
        externalMessageId: v4(),
        channel: {
          create: {
            channelName: v4(),
            externalChannelId: v4(),
            account: { create: {} },
          },
        },
      },
    });

    const messageShouldExist = await prisma.messages.findUnique({
      where: { id: message.id },
    });
    expect(messageShouldExist).toBeDefined();

    const res = await handleWebhook(
      {
        ...changeMessageEvent,
        event: {
          ...changeMessageEvent.event,
          previous_message: {
            ...changeMessageEvent.event.previous_message,
            ts: message.externalMessageId!,
          },
          message: {
            ...changeMessageEvent.event.message,
            ts: message.externalMessageId!,
          },
          channel: message.channel.externalChannelId!,
        },
      },
      console
    );

    const messageShouldHaveBeenUpdated = await prisma.messages.findFirst({
      where: {
        externalMessageId: message.externalMessageId!,
      },
    });

    expect(messageShouldHaveBeenUpdated?.body).not.toStrictEqual(
      messageShouldExist?.body
    );

    expect(messageShouldHaveBeenUpdated?.body).toStrictEqual('Lets test_4');
    // result OK:200
    expect(res.status).toBe(200);
    expect(res.message.body).toStrictEqual('Lets test_4');
  });
});
