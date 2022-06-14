import {
  findOrCreateAccount,
  findOrCreateAuth,
  findOrCreateUser,
  findOrCreateChannel,
  findOrCreateThread,
  findOrCreateMessage,
} from './factory';

import messages from './factory/messages';

(async () => {
  await findOrCreateAccount({ domain: 'empty.dev' });
  await findOrCreateAccount({
    domain: 'pulumi.dev',
    logoUrl: 'https://linen-assets.s3.amazonaws.com/pulumi-logo.svg',
  });
  await findOrCreateAccount({
    domain: 'prefect.dev',
    logoUrl: 'https://linen-assets.s3.amazonaws.com/prefect-logo.svg',
  });
  const account = await findOrCreateAccount({
    domain: 'linen.dev',
    logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
  });

  await findOrCreateAuth({ email: 'emil@linen.dev', accountId: account.id });
  await findOrCreateAuth({ email: 'jarek@linen.dev', accountId: account.id });
  await findOrCreateAuth({ email: 'kam@linen.dev', accountId: account.id });
  await findOrCreateAuth({ email: 'sandro@linen.dev', accountId: account.id });

  const user1 = await findOrCreateUser({
    accountsId: account.id,
    slackUserId: '1',
  });
  const user2 = await findOrCreateUser({
    accountsId: account.id,
    slackUserId: '2',
  });

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
      usersId: user1.id,
    });
    await findOrCreateMessage({
      body: `bar-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user1.id,
    });
    await findOrCreateMessage({
      body: `baz-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user2.id,
    });
    await findOrCreateMessage({
      body: `qux-${i}`,
      channelId: channel.id,
      threadId: thread.id,
      usersId: user2.id,
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
