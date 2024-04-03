/**
 * @jest-environment node
 */

import { accounts, prisma } from '@linen/database';
import { create } from '@linen/factory';
import { newSlackIntegration } from './slack';
import { v4 } from 'uuid';

// mocks
const fetchTeamInfo = async () => {
  return {
    body: {
      team: { url: `https://${v4()}` },
    },
  };
};
const eventNewIntegration = async (event: any) => {};
const getSlackAccessToken = async (
  code: string,
  clientId: string,
  clientSecret: string
) => {
  return {
    body: {
      ok: true,
      access_token: v4(),
      team: {
        id: v4(),
      },
      bot_user_id: v4(),
      scope: v4(),
      authed_user: {
        access_token: v4(),
        scope: v4(),
        id: v4(),
      },
    },
  };
};

describe('newSlackIntegration', () => {
  const store = {
    account: {} as accounts,
    account2: {} as accounts,
  };
  beforeAll(async () => {
    store.account = await create('account', {});
    store.account2 = await create('account', {});
  });

  test('happy path', async () => {
    // new integration with account1
    await newSlackIntegration({
      query: {
        code: v4(),
        state: store.account.id,
      },
      fetchTeamInfo,
      eventNewIntegration,
      getSlackAccessToken,
    });
    const auths = await prisma.slackAuthorizations.findMany({});
    // console.log('auths.length', auths.length);
    expect(auths.length).toBeGreaterThan(0);

    // new integration with account2
    await newSlackIntegration({
      query: { code: v4(), state: store.account2.id },
      fetchTeamInfo,
      eventNewIntegration,
      getSlackAccessToken,
    });
    // redo integration with account2
    await newSlackIntegration({
      query: { code: v4(), state: store.account2.id },
      fetchTeamInfo,
      eventNewIntegration,
      getSlackAccessToken,
    });
    const auths2 = await prisma.slackAuthorizations.findMany({});
    // console.log('auths2.length', auths2.length);
    expect(auths2.length).toBeGreaterThan(auths.length);

    // expect to have 1 row for account1
    expect(
      prisma.slackAuthorizations.findMany({
        where: { accountsId: store.account.id },
      })
    ).resolves.toHaveLength(1);

    // expect to have 1 row for account2
    expect(
      prisma.slackAuthorizations.findMany({
        where: { accountsId: store.account2.id },
      })
    ).resolves.toHaveLength(1);
  });

  test('account not found', async () => {
    const url = await newSlackIntegration({
      query: { code: v4(), state: v4() },
      fetchTeamInfo,
      eventNewIntegration,
      getSlackAccessToken,
    });
    expect(url).toBe('https://www.linen.dev/500?error=account-not-found');
  });
});
