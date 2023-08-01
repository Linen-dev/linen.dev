jest.mock('services/slack/api');

import { prismaMock } from '__tests__/singleton';
import { syncUsers } from './syncUsers';
import * as fetch_all_conversations from 'services/slack/api';

const account = {
  id: 'accountId123',
  slackTeamId: 'slackTeamId123',
  slackAuthorizations: [{ accessToken: 'token123' }],
};

const externalUser = {
  id: 'externalId',
  profile: { display_name: 'fakeName', image_original: 'url' },
  is_bot: false,
};

const internalUser = {
  accountsId: account.id,
  anonymousAlias: expect.any(String),
  displayName: externalUser.profile.display_name,
  externalUserId: externalUser.id,
  isAdmin: false,
  isBot: false,
  profileImageUrl: externalUser.profile.image_original,
};

describe('slackSync :: syncUsers', () => {
  test('syncUsers', async () => {
    const listUsersSpy = jest
      .spyOn(fetch_all_conversations, 'listUsers')
      .mockReturnValueOnce({
        body: {
          members: [externalUser],
        },
      } as any);
    const usersFindManyMock = prismaMock.users.findMany
      // .mockResolvedValueOnce([])
      .mockResolvedValueOnce([internalUser]);

    const usersUpsertMock = prismaMock.users.upsert.mockResolvedValue(null);

    const response = await syncUsers({
      account,
      accountId: account.id,
      token: account.slackAuthorizations[0].accessToken,
      listUsers: fetch_all_conversations.listUsers,
      logger: console,
    });
    expect(response).toMatchObject([internalUser]);

    expect(listUsersSpy).toBeCalledTimes(1);
    expect(listUsersSpy).toHaveBeenCalledWith(
      account.slackAuthorizations[0].accessToken
    );
    expect(usersFindManyMock).toBeCalledTimes(1);
    expect(usersFindManyMock).toHaveBeenCalledWith({
      where: { accountsId: account.id },
      select: {
        externalUserId: true,
        id: true,
      },
    });
    // expect(usersUpsertMock).toBeCalledTimes(1);
    const { anonymousAlias, ...rest } = internalUser;
    // expect(usersUpsertMock).toHaveBeenCalledWith({
    //   where: {
    //     externalUserId_accountsId: {
    //       accountsId: internalUser.accountsId,
    //       externalUserId: internalUser.externalUserId,
    //     },
    //   },
    //   create: internalUser,
    //   update: rest,
    // });
  });
});
