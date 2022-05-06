import {
  findOrCreateAccount,
  findOrCreateUser,
  findOrCreateChannel,
  findOrCreateThread,
  findOrCreateMessage,
} from './factory';

(async () => {
  const account = await findOrCreateAccount({ domain: 'linen.dev' });

  await findOrCreateUser({ email: 'emil@linen.dev', accountId: account.id });
  await findOrCreateUser({ email: 'jarek@linen.dev', accountId: account.id });
  await findOrCreateUser({ email: 'kam@linen.dev', accountId: account.id });
  await findOrCreateUser({ email: 'sandro@linen.dev', accountId: account.id });

  const channel = await findOrCreateChannel({
    name: 'general',
    accountId: account.id,
  });

  for (let i = 0; i < 100; i++) {
    const thread = await findOrCreateThread({
      channelId: channel.id,
      slug: `slug-${i}`,
    });
    await findOrCreateMessage({
      body: `foo-${i}`,
      channelId: channel.id,
      threadId: thread.id,
    });
    await findOrCreateMessage({
      body: `bar-${i}`,
      channelId: channel.id,
      threadId: thread.id,
    });
  }
})();
