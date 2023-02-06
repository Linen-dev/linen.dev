import { accounts } from '@linen/database';
import { v4 as random } from 'uuid';
import { create } from '@linen/factory';

describe.skip('build pagination', () => {
  const store = {
    account: {} as accounts,
    botToken: random(),
    discordServerId: random(),
  };
  beforeAll(async () => {
    store.account = await create('account', {});

    for (const idx of Array.from(Array(10).keys())) {
      const channel = await create('channel', {
        channelName: random(),
        accountId: store.account.id,
      });
      for (const idx of Array.from(Array(1000).keys())) {
        await create('threads', {
          sentAt: new Date(
            new Date().getTime() - Math.random() * 1e12
          ).getTime(),
          channelId: channel.id,
        });
      }
    }
  });

  test.skip('TODO', () => {});
});
