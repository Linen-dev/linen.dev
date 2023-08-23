import { accounts, channels } from '@linen/database';
import { v4 } from 'uuid';
import { create } from '@linen/factory';
import { handleWebhook } from '.';
import { generateRandomDate } from '__mocks__/generateRandomDate';

describe('webhook', () => {
  describe('bot messages', () => {
    let account: accounts;
    let channel: channels;
    let messageBody: string;
    let originalTs: string;

    const bot_profile = (account: any) => ({
      id: 'id',
      deleted: false,
      name: 'name',
      updated: 1671716222,
      app_id: 'app_id',
      icons: {
        image_36: 'image_36',
        image_48: 'image_48',
        image_72: 'image_72',
      },
      team_id: account.slackTeamId,
    });

    const attachments = [
      {
        id: 1,
        footer_icon: 'footer_icon',
        ts: 1673634784,
        color: 'color',
        fallback: 'fallback',
        pretext: 'pretext',
        title: 'title',
        callback_id: 'callback_id',
        footer: 'footer',
        fields: [],
        mrkdwn_in: ['text'],
        actions: [],
      },
    ];

    beforeAll(async () => {
      account = await create('account', {
        slackTeamId: v4(),
      });
      channel = await create('channel', {
        externalChannelId: v4(),
        accountId: account.id,
      });
      originalTs = generateRandomDate();
    });

    test('new message', async () => {
      const newMessage = {
        token: v4(),
        team_id: account.slackTeamId,
        context_team_id: account.slackTeamId,
        context_enterprise_id: null,
        api_app_id: v4(),
        event: {
          bot_id: v4(),
          type: 'message',
          text: '',
          user: v4(),
          ts: originalTs,
          app_id: v4(),
          team: account.slackTeamId,
          bot_profile: bot_profile(account),
          attachments,
          channel: channel.externalChannelId,
          event_ts: originalTs,
          channel_type: 'channel',
        },
        type: 'event_callback',
        event_id: v4(),
        event_time: 1673634786,
        authorizations: [],
        is_ext_shared_channel: false,
        event_context: v4(),
      };

      const result = await handleWebhook(newMessage, console);
      expect(result?.message?.body).not.toBe('');

      messageBody = result?.message?.body;
    });

    test('edit message', async () => {
      const ts = generateRandomDate();
      const editMessage = {
        token: v4(),
        team_id: account.slackTeamId,
        context_team_id: account.slackTeamId,
        context_enterprise_id: null,
        api_app_id: v4(),
        event: {
          type: 'message',
          subtype: 'message_changed',
          message: {
            bot_id: v4(),
            type: 'message',
            text: '',
            user: v4(),
            app_id: v4(),
            team: account.slackTeamId,
            bot_profile: bot_profile(account),
            edited: {
              user: v4(),
              ts: originalTs,
            },
            attachments,
            ts,
            source_team: account.slackTeamId,
            user_team: account.slackTeamId,
          },
          previous_message: {
            bot_id: v4(),
            type: 'message',
            text: '',
            user: v4(),
            ts,
            app_id: v4(),
            team: account.slackTeamId,
            bot_profile: bot_profile(account),
            attachments,
          },
          channel: channel.externalChannelId,
          hidden: true, // ???
          ts: originalTs,
          event_ts: originalTs,
          channel_type: 'channel',
        },
        type: 'event_callback',
        event_id: v4(),
        event_time: 1673634786,
        authorizations: [],
        is_ext_shared_channel: false,
        event_context: v4(),
      };

      const result = await handleWebhook(editMessage, console);
      expect(result?.message?.body).not.toBe('');
      expect(result?.message?.body).toBe(messageBody);
    });
  });
});
