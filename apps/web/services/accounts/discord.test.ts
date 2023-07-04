import { accounts, prisma } from '@linen/database';
import { create } from '@linen/factory';
import { newDiscordIntegration } from './discord';
import { v4 } from 'uuid';

// mocks
const createIntegrationDiscord = async () => {};
const eventNewIntegration = async (event: any) => {};
const getDiscordAccessToken = async (code: string) => {
  return {
    body: {
      refresh_token: v4(),
      guild: { id: v4() },
      expires_in: 100000,
    },
  };
};
const getCurrentConfig = () => ({
  PUBLIC_REDIRECT_URI: v4(),
  PUBLIC_CLIENT_ID: v4(),
  PRIVATE_TOKEN: v4(),
  PRIVATE_CLIENT_SECRET: v4(),
  PRIVATE_SCOPE: v4(),
  scope: [],
  permissions: v4(),
});

describe('newDiscordIntegration', () => {
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
    await newDiscordIntegration({
      query: {
        code: v4(),
        state: store.account.id,
      },
      createIntegrationDiscord,
      eventNewIntegration,
      getDiscordAccessToken,
      getCurrentConfig,
    });
    const auths = await prisma.discordAuthorizations.findMany();
    console.log('auths.length', auths.length);
    expect(auths.length).toBeGreaterThan(0);

    // new integration with account2
    await newDiscordIntegration({
      query: { code: v4(), state: store.account2.id },
      createIntegrationDiscord,
      eventNewIntegration,
      getDiscordAccessToken,
      getCurrentConfig,
    });
    // redo integration with account2
    await newDiscordIntegration({
      query: { code: v4(), state: store.account2.id },
      createIntegrationDiscord,
      eventNewIntegration,
      getDiscordAccessToken,
      getCurrentConfig,
    });
    const auths2 = await prisma.discordAuthorizations.findMany({});
    console.log('auths2.length', auths2.length);
    expect(auths2.length).toBeGreaterThan(auths.length);

    // expect to have 1 row for account1
    expect(
      prisma.discordAuthorizations.findMany({
        where: { accountsId: store.account.id },
      })
    ).resolves.toHaveLength(1);

    // expect to have 1 row for account2
    expect(
      prisma.discordAuthorizations.findMany({
        where: { accountsId: store.account2.id },
      })
    ).resolves.toHaveLength(1);
  });

  test('account not found', async () => {
    const url = await newDiscordIntegration({
      query: { code: v4(), state: v4() },
      createIntegrationDiscord,
      eventNewIntegration,
      getDiscordAccessToken,
      getCurrentConfig,
    });
    expect(url).toBe('https://www.linen.dev/500?error=account-not-found');
  });
});
