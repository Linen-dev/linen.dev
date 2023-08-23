import { prisma } from '@linen/database';
import { createAccount, createUser } from '@linen/factory';
import { handleWebhook } from 'services/slack/webhooks';
import { v4 } from 'uuid';

const userUpdateEvent = (id = v4(), userId = v4()) => ({
  token: 'xacv5epJ26YAuNHJeO4UoaNf',
  team_id: id,
  api_app_id: 'A0123456789',
  event: {
    user: {
      id: userId,
      team_id: id,
      name: 'cool_name',
      deleted: false,
      color: '2b6836',
      real_name: 'randomName',
      tz: 'America/Buenos_Aires',
      tz_label: 'Argentina Time',
      tz_offset: -10800,
      profile: {
        title: '',
        phone: '',
        skype: '',
        real_name: 'randomName',
        real_name_normalized: 'randomName',
        display_name: 'randomName.2',
        display_name_normalized: 'randomName.2',
        fields: {},
        status_text: '',
        status_emoji: '',
        status_emoji_display_info: [],
        status_expiration: 0,
        avatar_hash: 'gf1231231231',
        first_name: 'randomName',
        last_name: '',
        status_text_canonical: '',
        team: id,
      },
      is_admin: false,
      is_owner: false,
      is_primary_owner: false,
      is_restricted: false,
      is_ultra_restricted: false,
      is_bot: false,
      is_app_user: false,
      updated: 1658512282,
      is_email_confirmed: true,
      who_can_share_contact_card: 'EVERYONE',
      locale: 'en-US',
    },
    cache_ts: 1658512282,
    type: 'user_profile_changed',
    event_ts: '1658512282.000800',
  },
  type: 'event_callback',
  event_id: 'Ev03RCH5NB08',
  event_time: 1658512282,
  authorizations: [
    {
      enterprise_id: null,
      team_id: id,
      user_id: userId,
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
});

describe('webhook :: users', () => {
  describe('user_profile_changed event', () => {
    test('happy path :: existent user has their profile updated', async () => {
      const event = userUpdateEvent();
      const account = await createAccount({ slackTeamId: event.team_id });
      const user = await createUser({
        displayName: 'old',
        accountsId: account.id,
        externalUserId: event.event.user.id,
      });

      const res = await handleWebhook(event, console);

      expect(res?.status).toBe(200);
      expect(res?.message).toStrictEqual('user profile updated');

      const updatedUser = await prisma.users.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.displayName).toBe(
        event.event.user.profile.display_name
      );
    });

    test('user does not exist :: it should create a new user', async () => {
      const event = userUpdateEvent();
      const account = await createAccount({ slackTeamId: event.team_id });

      const res = await handleWebhook(event, console);
      expect(res?.status).toBe(200);
      expect(res?.message).toStrictEqual('user profile updated');

      const newUser = await prisma.users.findUnique({
        where: {
          externalUserId_accountsId: {
            accountsId: account.id,
            externalUserId: event.event.user.id,
          },
        },
      });
      expect(newUser?.displayName).toBe(event.event.user.profile.display_name);
    });
  });
});
