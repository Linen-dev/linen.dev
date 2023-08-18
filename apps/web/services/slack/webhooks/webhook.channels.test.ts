jest.mock('services/events/eventChannelUpdate');
import { accounts, prisma } from '@linen/database';
import { createAccount, createChannel } from '@linen/factory';
import { handleWebhook } from 'services/slack/webhooks';
import { v4 } from 'uuid';

const channelRenameEvent = (
  team_id: string,
  externalId = v4(),
  channelName = v4()
) => ({
  token: v4(),
  team_id,
  api_app_id: v4(),
  event: {
    type: 'channel_rename',
    channel: {
      id: externalId,
      is_channel: true,
      is_mpim: false,
      name: channelName,
      name_normalized: channelName,
      created: 1657208098,
    },
    event_ts: '1657208648.003400',
  },
  type: 'event_callback',
  event_id: 'Ev03N8RA23DM',
  event_time: 1657208648,
  authorizations: [
    {
      enterprise_id: null,
      team_id,
      user_id: v4(),
      is_bot: true,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
});

const channelCreatedEvent = (team_id: string, channelName = v4()) => ({
  token: v4(),
  team_id,
  api_app_id: v4(),
  event: {
    type: 'channel_created',
    channel: {
      id: v4(),
      is_channel: true,
      name: channelName,
      name_normalized: channelName,
      created: 1657210637,
      creator: v4(),
      is_shared: false,
      is_org_shared: false,
    },
    event_ts: '1657210637.005100',
  },
  type: 'event_callback',
  event_id: v4(),
  event_time: 1657210637,
  authorizations: [
    {
      enterprise_id: null,
      team_id,
      user_id: v4(),
      is_bot: true,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
});

describe('webhook :: channels', () => {
  let account: accounts;
  beforeAll(async () => {
    account = await createAccount({
      slackTeamId: v4(),
    });
    await prisma.slackAuthorizations.create({
      data: {
        accountsId: account.id,
        accessToken: v4(),
        botUserId: v4(),
        scope: v4(),
        joinChannel: true,
      },
    });
  });
  describe('channel_created event', () => {
    test('happy path :: create a new channel', async () => {
      const event = channelCreatedEvent(account.slackTeamId!);

      const shouldBeEmpty = await prisma.channels.findFirst({
        where: {
          accountId: account.id,
          channelName: event.event.channel.name,
        },
      });
      expect(shouldBeEmpty).toBe(null);

      const res = await handleWebhook(event, console);

      expect(res?.status).toBe(200);
      expect(res?.message).toStrictEqual('channel created');

      const channel = await prisma.channels.findFirst({
        where: {
          accountId: account.id,
          channelName: event.event.channel.name,
        },
      });

      expect(channel).toMatchObject({
        accountId: account.id,
        channelName: event.event.channel.name,
        archived: false,
        default: false,
        hidden: false,
        landing: false,
        type: 'PUBLIC',
        viewType: 'CHAT',
      });
    });

    test('account does not exists :: it should return 404', async () => {
      const event = channelCreatedEvent(v4());

      const res = await handleWebhook(event, console);

      expect(res?.status).toBe(404);
      expect(res?.error).toStrictEqual('account not found');
    });
  });

  describe('channel_rename event', () => {
    test('happy path :: rename channel', async () => {
      const event = channelRenameEvent(account.slackTeamId!);
      const externalChannelId = event.event.channel.id;

      const existentChannel = await createChannel({
        externalChannelId,
        accountId: account.id,
        channelName: v4(),
      });

      expect(existentChannel.channelName).not.toBe(event.event.channel.name);

      const res = await handleWebhook(event, console);

      expect(res?.status).toBe(200);
      expect(res?.message).toStrictEqual('channel renamed');

      const updatedChannel = await prisma.channels.findFirst({
        where: { externalChannelId },
      });
      expect(updatedChannel).not.toBeNull();
      expect(updatedChannel?.channelName).toBe(event.event.channel.name);
    });

    test('account does not exists :: it should return 404', async () => {
      const event = channelRenameEvent(v4());

      const res = await handleWebhook(event, console);

      expect(res?.status).toBe(404);
      expect(res?.error).toStrictEqual('account not found');
    });

    test('channel does not exists :: it should create a new one', async () => {
      const event = channelRenameEvent(account.slackTeamId!);
      const externalChannelId = event.event.channel.id;

      const shouldNotExist = await prisma.channels.findFirst({
        where: { externalChannelId },
      });

      expect(shouldNotExist).toBeNull();

      const res = await handleWebhook(event, console);

      expect(res?.status).toBe(200);
      expect(res?.message).toStrictEqual('channel created');

      const newChannel = await prisma.channels.findFirst({
        where: { externalChannelId },
      });
      expect(newChannel).not.toBeNull();
      expect(newChannel?.channelName).toBe(event.event.channel.name);
      expect(newChannel).toMatchObject({
        accountId: account.id,
        channelName: event.event.channel.name,
        archived: false,
        default: false,
        hidden: false,
        landing: false,
        type: 'PUBLIC',
        viewType: 'CHAT',
      });
    });
  });
});
