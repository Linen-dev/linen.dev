jest.mock('services/slack/api');
import { syncUsers } from './syncUsers';
import * as fetch_all_conversations from 'services/slack/api';
import { v4 } from 'uuid';
import { prisma } from '@linen/database';

describe('slackSync :: syncUsers', () => {
  test('syncUsers', async () => {
    const account = await prisma.accounts.create({
      include: { slackAuthorizations: true, channels: true },
      data: {
        slackTeamId: v4(),
        slackAuthorizations: {
          create: {
            accessToken: v4(),
            botUserId: v4(),
            scope: v4(),
          },
        },
        channels: {
          create: {
            channelName: v4(),
            externalChannelId: v4(),
          },
        },
      },
    });
    const externalUser = {
      id: v4(),
      profile: { display_name: v4() },
      is_bot: false,
    };

    jest.spyOn(fetch_all_conversations, 'listUsers').mockReturnValueOnce({
      body: {
        members: [externalUser],
      },
    } as any);

    await syncUsers({
      account,
      accountId: account.id,
      token: account.slackAuthorizations[0].accessToken,
      listUsers: fetch_all_conversations.listUsers,
      logger: console,
      fullSync: true,
    });

    const internalUser = {
      accountsId: account.id,
      anonymousAlias: expect.any(String),
      displayName: externalUser.profile.display_name,
      externalUserId: externalUser.id,
      isAdmin: false,
      isBot: false,
    };

    const users = await prisma.users.findMany({
      where: { accountsId: account.id },
    });

    expect(users[0]).toMatchObject(internalUser);
  });
});
