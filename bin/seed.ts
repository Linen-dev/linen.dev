import {
  findOrCreateAccount,
  findOrCreateUser,
  findOrCreateChannel,
  findOrCreateThread,
  findOrCreateMessage,
} from './factory';

import messages from './factory/messages';

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
      slug: `slug-general-${i}`,
    });
    await findOrCreateMessage({
      body: messages[i] || `foo-${i}`,
      channelId: channel.id,
      threadId: thread.id,
    });
    await findOrCreateMessage({
      body: `bar-${i}`,
      channelId: channel.id,
      threadId: thread.id,
    });
  }

  const channel2 = await findOrCreateChannel({
    name: 'sql',
    accountId: account.id,
  });

  for (let i = 0; i < 50; i++) {
    const thread = await findOrCreateThread({
      channelId: channel2.id,
      slug: `slug-sql-${i}`,
    });

    await findOrCreateMessage({
      body: `baz-${i}`,
      channelId: channel2.id,
      threadId: thread.id,
    });
    await findOrCreateMessage({
      body: `qux-${i}`,
      channelId: channel2.id,
      threadId: thread.id,
    });
  }

  const channel3 = await findOrCreateChannel({
    name: 'alpha',
    accountId: account.id,
  });

  for (let i = 0; i < 50; i++) {
    const thread = await findOrCreateThread({
      channelId: channel3.id,
      slug: `slug-alpha-${i}`,
    });

    await findOrCreateMessage({
      body: `bam-${i}`,
      channelId: channel3.id,
      threadId: thread.id,
    });
    await findOrCreateMessage({
      body: `quux-${i}`,
      channelId: channel3.id,
      threadId: thread.id,
    });
  }
})();
