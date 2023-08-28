import {
  createAccount,
  createChannel,
  createMessage,
  createThread,
  createUser,
} from '@linen/factory';
import { getAccountSettings } from '../src/utils/shared';
import { logger } from './logger';
import { setup } from '../src';
import { SerializedSearchSettings } from '@linen/types';
import { fetcher } from './fetcher';
import { prisma } from '@linen/database';

describe('anonymous community', () => {
  let accountId: string;
  let searchSettings: SerializedSearchSettings;
  beforeAll(async () => {
    /**
     * create public account
     * public channel
     * few threads with messages
     * trigger setup
     * trigger dump
     */
    const account = await createAccount({
      type: 'PUBLIC',
      anonymizeUsers: true,
      anonymize: 'ALL',
    });
    const channel = await createChannel({ accountId: account.id });
    const user = await createUser({
      accountsId: account.id,
      displayName: 'realName',
      anonymousAlias: 'anonymousName',
    });
    accountId = account.id;

    const thread1 = await createThread({ channelId: channel.id });
    await createMessage({
      threadId: thread1.id,
      channelId: channel.id,
      body: 'lorem',
      usersId: user.id,
    });
    await createMessage({
      threadId: thread1.id,
      channelId: channel.id,
      body: 'ipsum',
      usersId: user.id,
    });

    const thread2 = await createThread({ channelId: channel.id });
    await createMessage({
      threadId: thread2.id,
      channelId: channel.id,
      body: 'dolor',
      usersId: user.id,
    });
    await createMessage({
      threadId: thread2.id,
      channelId: channel.id,
      body: 'sit amet',
      usersId: user.id,
    });

    await setup({ accountId: account.id, logger });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({ where: { accountsId: accountId } });
    await prisma.accounts.delete({ where: { id: accountId } });
  });

  test('community token should exist', async () => {
    const accountSettings = await getAccountSettings(accountId, logger);
    expect(accountSettings?.searchSettings).toBeDefined();
    expect(accountSettings?.searchSettings.apiKey).toBeDefined();
    expect(accountSettings?.searchSettings.scope).toBe('public');
    searchSettings = accountSettings?.searchSettings!;
  });

  test('query for anonymous name should work', async () => {
    const results1 = await fetcher(searchSettings.apiKey, 'anonymousName');
    expect(results1).toBeDefined();
    expect(results1.results[0].hits).toHaveLength(2);
    const hits = results1.results[0].hits;
    expect(hits[0].document.author_name).toContain('anonymousName');
    expect(hits[1].document.author_name).toContain('anonymousName');
  });

  test('query for real name should fail', async () => {
    const results1 = await fetcher(searchSettings.apiKey, 'realName');
    expect(results1).toBeDefined();
    expect(results1.results[0].hits).toHaveLength(0);
  });
});
