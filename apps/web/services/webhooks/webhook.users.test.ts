import { prismaMock } from '__tests__/singleton';
import type { accounts } from '@linen/database';
import { handleWebhook } from 'services/webhooks';

const userUpdateEvent = {
  token: 'xacv5epJ26YAuNHJeO4UoaNf',
  team_id: 'T01234567',
  api_app_id: 'A0123456789',
  event: {
    user: {
      id: 'U0123456789',
      team_id: 'T01234567',
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
        team: 'T01234567',
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
      team_id: 'T01234567',
      user_id: 'U0123456789',
      is_bot: false,
      is_enterprise_install: false,
    },
  ],
  is_ext_shared_channel: false,
};

describe('webhook :: users', () => {
  describe('user_profile_changed event', () => {
    test('happy path :: existent user has their profile updated', async () => {
      const accountId = userUpdateEvent.team_id;
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue({
          id: accountId,
        } as accounts);
      const usersUpdateMock = prismaMock.users.update.mockResolvedValue({});
      const usersFindUniqueMock = prismaMock.users.findUnique.mockResolvedValue(
        {
          id: 'userId',
          anonymousAlias: 'randomAlias',
        }
      );

      const res = await handleWebhook(userUpdateEvent);

      expect(res.status).toBe(200);
      expect(res.message).toStrictEqual('user profile updated');

      expect(accountsFindFirstMock).toHaveBeenCalledTimes(1);
      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true, newChannelsConfig: true },
        where: { slackTeamId: userUpdateEvent.team_id },
      });
      expect(usersFindUniqueMock).toHaveBeenCalledTimes(1);
      expect(usersFindUniqueMock).toHaveBeenCalledWith({
        where: {
          externalUserId_accountsId: {
            accountsId: userUpdateEvent.team_id,
            externalUserId: userUpdateEvent.event.user.id,
          },
        },
      });
      expect(usersUpdateMock).toHaveBeenCalledTimes(1);
      expect(usersUpdateMock).toHaveBeenCalledWith({
        data: {
          accountsId: userUpdateEvent.team_id,
          anonymousAlias: 'randomAlias',
          displayName: userUpdateEvent.event.user.profile.display_name,
          externalUserId: userUpdateEvent.event.user.id,
          isAdmin: userUpdateEvent.event.user.is_admin,
          isBot: userUpdateEvent.event.user.is_bot,
          profileImageUrl: undefined,
        },
        where: {
          id: 'userId',
        },
      });
    });

    test('user does not exist :: it should create a new user', async () => {
      const accountId = userUpdateEvent.team_id;
      const accountsFindFirstMock =
        prismaMock.accounts.findFirst.mockResolvedValue({
          id: accountId,
        } as accounts);
      const usersCreateMock = prismaMock.users.create.mockResolvedValue({});
      const usersFindUniqueMock =
        prismaMock.users.findUnique.mockResolvedValue(null);

      const res = await handleWebhook(userUpdateEvent);

      expect(res.status).toBe(200);
      expect(res.message).toStrictEqual('user profile updated');

      expect(accountsFindFirstMock).toHaveBeenCalledTimes(1);
      expect(accountsFindFirstMock).toHaveBeenCalledWith({
        select: { id: true, newChannelsConfig: true },
        where: { slackTeamId: userUpdateEvent.team_id },
      });
      expect(usersFindUniqueMock).toHaveBeenCalledTimes(2);
      expect(usersFindUniqueMock).toHaveBeenCalledWith({
        where: {
          externalUserId_accountsId: {
            accountsId: userUpdateEvent.team_id,
            externalUserId: userUpdateEvent.event.user.id,
          },
        },
      });
      expect(usersCreateMock).toHaveBeenCalledTimes(1);
      expect(usersCreateMock).toHaveBeenCalledWith({
        data: {
          accountsId: userUpdateEvent.team_id,
          anonymousAlias: expect.any(String),
          displayName: userUpdateEvent.event.user.profile.display_name,
          externalUserId: userUpdateEvent.event.user.id,
          isAdmin: false,
          isBot: false,
          profileImageUrl: undefined,
        },
      });
    });
  });
});
