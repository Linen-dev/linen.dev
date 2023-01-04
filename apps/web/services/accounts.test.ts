jest.mock('services/events/eventNewIntegration');
import { create } from '__tests__/factory';
import type { accounts } from '@prisma/client';
import { v4 } from 'uuid';
import AccountsService from './accounts';
import prisma from 'client';
import { decrypt } from 'utilities/crypto';

describe('accounts service', () => {
  const store = {
    account: {} as accounts,
    botToken: v4(),
    discordServerId: v4(),
  };
  beforeAll(async () => {
    store.account = await create('account', {});
  });

  test('setCustomBotDiscord', async () => {
    await AccountsService.setCustomBotDiscord({
      accountId: store.account.id,
      botToken: store.botToken,
      discordServerId: store.discordServerId,
    });

    const account = await prisma.accounts.findUnique({
      select: { discordAuthorizations: true },
      where: { id: store.account.id },
    });
    expect(account).toBeDefined();
    expect(account?.discordAuthorizations).toHaveLength(1);

    const auth = account!.discordAuthorizations[0];
    expect(auth.accessToken).not.toStrictEqual(store.botToken);
    const decrypted = await decrypt(auth.accessToken);
    expect(decrypted).toStrictEqual(store.botToken);
  });
});
