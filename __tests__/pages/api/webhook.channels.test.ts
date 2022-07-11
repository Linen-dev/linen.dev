import { accounts, channels } from '@prisma/client';
import { testApiHandler } from 'next-test-api-route-handler';
import { prismaMock } from '../../singleton';
import handler from '../../../pages/api/webhook';

const channelRenameEvent = {
  token: 'xacv5epJ26YAuNHJeO4UoaNf',
  team_id: 'T03ECUWHFGD',
  api_app_id: 'A03DSC9PK4K',
  event: {
    type: 'channel_rename',
    channel: {
      id: 'C03NGPMCX1C',
      is_channel: true,
      is_mpim: false,
      name: 'newnewch2',
      name_normalized: 'newnewch2',
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
      team_id: 'T03ECUWHFGD',
      user_id: 'U03ENAMC6AE',
      is_bot: true,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
};

const channelCreatedEvent = {
  token: 'xacv5epJ26YAuNHJeO4UoaNf',
  team_id: 'T03ECUWHFGD',
  api_app_id: 'A03DSC9PK4K',
  event: {
    type: 'channel_created',
    channel: {
      id: 'C03P28QD4KT',
      is_channel: true,
      name: 'new2',
      name_normalized: 'new2',
      created: 1657210637,
      creator: 'U03FCDP4K7S',
      is_shared: false,
      is_org_shared: false,
    },
    event_ts: '1657210637.005100',
  },
  type: 'event_callback',
  event_id: 'Ev03PDBY3PFA',
  event_time: 1657210637,
  authorizations: [
    {
      enterprise_id: null,
      team_id: 'T03ECUWHFGD',
      user_id: 'U03ENAMC6AE',
      is_bot: true,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
};

describe('webhook :: channels', () => {
  describe('channel_created event', () => {
    test('happy path :: create a new channel', async () => {
      const accountId = 'accountId';
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue({
          id: accountId,
        } as accounts);
      const channelsCreateMock = prismaMock.channels.create.mockResolvedValue(
        {} as channels
      );

      await testApiHandler({
        handler,
        url: '/api/webhook',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(channelCreatedEvent),
          });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({});
        },
      });

      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true },
        where: { slackTeamId: channelCreatedEvent.team_id },
      });
      expect(channelsCreateMock).toHaveBeenCalledWith({
        data: {
          channelName: channelCreatedEvent.event.channel.name,
          accountId,
          slackChannelId: channelCreatedEvent.event.channel.id,
          hidden: false,
        },
      });
    });

    test('account does not exists :: it should return 404', async () => {
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue(null);
      await testApiHandler({
        handler,
        url: '/api/webhook',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(channelCreatedEvent),
          });
          expect(res.status).toBe(404);
          await expect(res.json()).resolves.toStrictEqual({
            error: 'account not found',
          });
        },
      });
      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true },
        where: { slackTeamId: channelCreatedEvent.team_id },
      });
    });
  });

  describe('channel_rename event', () => {
    test('happy path :: rename channel', async () => {
      const accountId = 'accountId';
      const channelId = 'channelId';
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue({
          id: accountId,
        } as accounts);
      const channelsFindFirstMock =
        prismaMock.channels.findFirst.mockResolvedValue({
          id: channelId,
        } as channels);
      const channelsUpdateMock = prismaMock.channels.update.mockResolvedValue(
        {} as channels
      );
      await testApiHandler({
        handler,
        url: '/api/webhook',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(channelRenameEvent),
          });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({});
        },
      });
      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true },
        where: { slackTeamId: channelRenameEvent.team_id },
      });
      expect(channelsFindFirstMock).toHaveBeenCalledWith({
        where: {
          slackChannelId: channelRenameEvent.event.channel.id,
          accountId,
        },
      });
      expect(channelsUpdateMock).toHaveBeenCalledWith({
        where: {
          id: channelId,
        },
        data: {
          channelName: channelRenameEvent.event.channel.name,
        },
      });
    });

    test('account does not exists :: it should return 404', async () => {
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue(null);
      await testApiHandler({
        handler,
        url: '/api/webhook',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(channelRenameEvent),
          });
          expect(res.status).toBe(404);
          await expect(res.json()).resolves.toStrictEqual({
            error: 'account not found',
          });
        },
      });
      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true },
        where: { slackTeamId: channelRenameEvent.team_id },
      });
    });

    test('channel does not exists :: it should create a new one', async () => {
      const accountId = 'accountId';
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue({
          id: accountId,
        } as accounts);
      const channelsFindFirstMock =
        prismaMock.channels.findFirst.mockResolvedValue(null);
      const channelsCreateMock = prismaMock.channels.create.mockResolvedValue(
        {} as channels
      );
      await testApiHandler({
        handler,
        url: '/api/webhook',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(channelRenameEvent),
          });
          expect(res.status).toBe(200);
          await expect(res.json()).resolves.toStrictEqual({});
        },
      });
      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true },
        where: { slackTeamId: channelRenameEvent.team_id },
      });
      expect(channelsFindFirstMock).toHaveBeenCalledWith({
        where: {
          slackChannelId: channelRenameEvent.event.channel.id,
          accountId,
        },
      });
      expect(channelsCreateMock).toHaveBeenCalledWith({
        data: {
          channelName: channelRenameEvent.event.channel.name,
          accountId,
          slackChannelId: channelRenameEvent.event.channel.id,
          hidden: false,
        },
      });
    });
  });
});
