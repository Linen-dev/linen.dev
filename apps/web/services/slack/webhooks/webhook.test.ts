jest.mock('services/users');
import { handleWebhook } from 'services/slack/webhooks';
import { v4 } from 'uuid';
import { prisma } from '@linen/database';
import { generateRandomDate } from '__mocks__/generateRandomDate';
import { createAccount, createChannel } from '@linen/factory';
type ReturnedPromiseResolvedType<T> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;

const addMessageEvent = ({
  team_id,
  ts = generateRandomDate(),
  channel_id,
}: {
  team_id: string;
  ts?: string;
  channel_id: string;
}) => ({
  token: v4(),
  team_id,
  api_app_id: v4(),
  event: {
    client_msg_id: v4(),
    type: 'message',
    text: 'this is test3',
    user: v4(),
    ts,
    team: team_id,
    blocks: [{ type: 'rich_text', block_id: '9hC', elements: [] }],
    channel: channel_id,
    event_ts: ts,
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: v4(),
  event_time: 1650805199,
  authorizations: [
    {
      enterprise_id: null,
      team_id,
      user_id: v4(),
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context: v4(),
});

const deleteMessageEvent = ({
  team_id,
  ts = generateRandomDate(),
  channel_id,
}: {
  team_id: string;
  ts: string;
  channel_id: string;
}) => ({
  token: v4(),
  team_id,
  api_app_id: v4(),
  event: {
    type: 'message',
    subtype: 'message_deleted',
    previous_message: {
      client_msg_id: v4(),
      type: 'message',
      text: 'yet another test',
      user: v4(),
      ts,
      team: team_id,
      blocks: [],
    },
    channel: channel_id,
    hidden: true,
    deleted_ts: ts,
    event_ts: generateRandomDate(),
    ts: generateRandomDate(),
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: v4(),
  event_time: 1651046639,
  authorizations: [
    {
      enterprise_id: null,
      team_id,
      user_id: v4(),
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context: v4(),
});

const changeMessageEvent = ({
  team_id,
  ts,
  channel_id,
}: {
  team_id: string;
  ts: string;
  channel_id: string;
}) => ({
  token: v4(),
  team_id: team_id,
  api_app_id: v4(),
  event: {
    type: 'message',
    subtype: 'message_changed',
    message: {
      client_msg_id: v4(),
      type: 'message',
      text: 'Lets test_4',
      user: v4(),
      team: team_id,
      edited: [{}],
      blocks: [{ type: 'rich_text', block_id: '9hC', elements: [] }],
      ts: ts,
      source_team: team_id,
      user_team: team_id,
    },
    previous_message: {
      client_msg_id: v4(),
      type: 'message',
      text: v4(),
      user: v4(),
      ts: ts,
      team: team_id,
      blocks: [{ type: 'rich_text', block_id: '9hC', elements: [] }],
    },
    channel: channel_id,
    hidden: true,
    ts: generateRandomDate(),
    event_ts: generateRandomDate(),
    channel_type: 'channel',
  },
  type: 'event_callback',
  event_id: v4(),
  event_time: 1652202460,
  authorizations: [
    {
      enterprise_id: null,
      team_id: team_id,
      user_id: v4(),
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
  event_context: v4(),
});

describe('webhook', () => {
  let addEvent: ReturnType<typeof addMessageEvent>;
  let changeEvent: ReturnType<typeof changeMessageEvent>;
  let deleteEvent: ReturnType<typeof deleteMessageEvent>;
  let account: ReturnedPromiseResolvedType<typeof createAccount>;
  let channel: ReturnedPromiseResolvedType<typeof createChannel>;

  beforeAll(async () => {
    const team_id = v4();
    const channel_id = v4();

    addEvent = addMessageEvent({ team_id, channel_id });
    changeEvent = changeMessageEvent({
      channel_id,
      team_id,
      ts: addEvent.event.ts,
    });
    deleteEvent = deleteMessageEvent({
      channel_id,
      team_id,
      ts: addEvent.event.ts,
    });
    account = await createAccount({
      slackTeamId: addEvent.team_id,
    });
    channel = await createChannel({
      channelName: v4(),
      externalChannelId: addEvent.event.channel,
      accountId: account.id,
      hidden: false,
    });
  });

  it('add message - new thread', async () => {
    const res = await handleWebhook(addEvent, console);
    expect(res.status).toBe(200);
    expect(res.message.body).toStrictEqual('this is test3');

    const message = await prisma.messages.findUnique({
      where: {
        channelId_externalMessageId: {
          channelId: channel.id,
          externalMessageId: addEvent.event.ts,
        },
      },
    });
    expect(message).toBeDefined();
    expect(message?.body).toStrictEqual('this is test3');
    expect(message?.id).toBe(res.message.id);
    expect(message?.channelId).toBe(channel.id);

    const thread = await prisma.threads.findUnique({
      where: { id: message?.threadId! },
    });
    expect(thread).toBeDefined();
    expect(message?.externalMessageId).toBe(thread?.externalThreadId);
    // });

    // it('change message', async () => {
    const res2 = await handleWebhook(changeEvent, console);
    expect(res2?.status).toBe(200);
    expect(res2?.message.body).toStrictEqual('Lets test_4');

    const updatedMessage = await prisma.messages.findUnique({
      where: {
        channelId_externalMessageId: {
          channelId: channel.id,
          externalMessageId: addEvent.event.ts,
        },
      },
    });

    expect(updatedMessage?.body).toStrictEqual('Lets test_4');

    // });

    // it('delete message', async () => {
    const res3 = await handleWebhook(deleteEvent, console);
    expect(res3.status).toBe(200);
    expect(res3.message).toStrictEqual({});

    const deletedMessage = await prisma.messages.findUnique({
      where: {
        channelId_externalMessageId: {
          channelId: channel.id,
          externalMessageId: addEvent.event.ts,
        },
      },
    });
    expect(deletedMessage).toBeNull();
  });
});
