import {
  createAccount,
  createAuth,
  createChannel,
  createMessage,
  createThread,
  createUser,
} from '@linen/factory';
import { SerializedSearchSettings } from '@linen/types';
import { setup } from '../src';
import { logger } from './logger';
import { prisma } from '@linen/database';
import { getAccountSettings } from '../src/utils/shared';
import { fetcher } from './fetcher';

describe('private community', () => {
  let accountId: string;
  let userId1: string;
  let userId2: string;
  beforeAll(async () => {
    /**
     * create private account
     * few users
     * public channel and private channel
     * few threads with messages in both channels
     * sign-in an user and join the private channel
     * sign-in another user without joining the private channel (user2)
     * trigger setup
     * trigger sync
     */
    const account = await createAccount({ type: 'PRIVATE' });
    const channel = await createChannel({
      accountId: account.id,
      type: 'PUBLIC',
    });
    const channelPrivate = await createChannel({
      accountId: account.id,
      type: 'PRIVATE',
    });
    const auth1 = await createAuth({ accountId: account.id });
    const user1 = await createUser({
      accountsId: account.id,
      authsId: auth1.id,
    });
    userId1 = user1.id;
    await prisma.memberships.create({
      data: {
        channelsId: channelPrivate.id,
        usersId: user1.id,
      },
    });
    const auth2 = await createAuth({ accountId: account.id });
    const user2 = await createUser({
      accountsId: account.id,
      authsId: auth2.id,
    });
    userId2 = user2.id;
    accountId = account.id;

    const thread1 = await createThread({ channelId: channel.id });
    await createMessage({
      threadId: thread1.id,
      channelId: channel.id,
      body: 'lorem public',
      usersId: user1.id,
    });
    await createMessage({
      threadId: thread1.id,
      channelId: channel.id,
      body: 'ipsum public',
      usersId: user1.id,
    });

    const thread2 = await createThread({ channelId: channel.id });
    await createMessage({
      threadId: thread2.id,
      channelId: channel.id,
      body: 'dolor public',
      usersId: user1.id,
    });
    await createMessage({
      threadId: thread2.id,
      channelId: channel.id,
      body: 'sit amet public',
      usersId: user1.id,
    });

    const thread1private = await createThread({ channelId: channelPrivate.id });
    await createMessage({
      threadId: thread1private.id,
      channelId: channelPrivate.id,
      body: 'lorem private',
      usersId: user1.id,
    });
    await createMessage({
      threadId: thread1private.id,
      channelId: channelPrivate.id,
      body: 'ipsum private',
      usersId: user1.id,
    });

    const thread2private = await createThread({ channelId: channelPrivate.id });
    await createMessage({
      threadId: thread2private.id,
      channelId: channelPrivate.id,
      body: 'dolor private',
      usersId: user1.id,
    });
    await createMessage({
      threadId: thread2private.id,
      channelId: channelPrivate.id,
      body: 'sit amet private',
      usersId: user1.id,
    });

    await setup({ accountId: account.id, logger });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({ where: { accountsId: accountId } });
    await prisma.accounts.delete({ where: { id: accountId } });
  });

  test('community token should not exist', async () => {
    const accountSettings = await getAccountSettings(accountId, logger);
    expect(accountSettings?.searchSettings).toBeDefined();
    expect(accountSettings?.searchSettings.apiKey).toBeDefined();
    expect(accountSettings?.searchSettings.scope).toBe('private');
  });

  describe('using user token', () => {
    let searchSettings: SerializedSearchSettings;

    test('user1 token should exist', async () => {
      const user = await prisma.users.findUniqueOrThrow({
        where: { id: userId1 },
      });
      const userSettings: SerializedSearchSettings = JSON.parse(
        user.searchSettings!
      );
      expect(userSettings).toBeDefined();
      expect(userSettings.apiKey).toBeDefined();
      expect(userSettings.scope).toBe('private');
      searchSettings = userSettings;
    });

    test('querying for messages from public channel should work', async () => {
      const data = await fetcher(searchSettings.apiKey, 'public');
      expect(data).toBeDefined();
      expect(data.results[0].hits).toHaveLength(2);
      expect(data.results[0].hits[0].document.body).toContain('public');
      expect(data.results[0].hits[0].document.body).not.toContain('private');
      expect(data.results[0].hits[1].document.body).toContain('public');
      expect(data.results[0].hits[1].document.body).not.toContain('private');
    });
    test('querying for messages from private channel should work', async () => {
      const data = await fetcher(searchSettings.apiKey, 'private');
      expect(data).toBeDefined();
      expect(data.results[0].hits).toHaveLength(2);
      expect(data.results[0].hits[0].document.body).toContain('private');
      expect(data.results[0].hits[0].document.body).not.toContain('public');
      expect(data.results[0].hits[1].document.body).toContain('private');
      expect(data.results[0].hits[1].document.body).not.toContain('public');
    });
  });

  describe('using user2 token', () => {
    let searchSettings: SerializedSearchSettings;

    test('user2 token should exist', async () => {
      const user = await prisma.users.findUniqueOrThrow({
        where: { id: userId2 },
      });
      const userSettings: SerializedSearchSettings = JSON.parse(
        user.searchSettings!
      );
      expect(userSettings).toBeDefined();
      expect(userSettings.apiKey).toBeDefined();
      expect(userSettings.scope).toBe('private');
      searchSettings = userSettings;
    });

    test('querying for messages from public channel should work', async () => {
      const data = await fetcher(searchSettings.apiKey, 'public');
      expect(data).toBeDefined();
      expect(data.results[0].hits).toHaveLength(2);
      expect(data.results[0].hits[0].document.body).toContain('public');
      expect(data.results[0].hits[0].document.body).not.toContain('private');
      expect(data.results[0].hits[1].document.body).toContain('public');
      expect(data.results[0].hits[1].document.body).not.toContain('private');
    });
    test('querying for messages from private channel should fail', async () => {
      const data = await fetcher(searchSettings.apiKey, 'private');
      expect(data).toBeDefined();
      expect(data.results[0].hits).toHaveLength(0);
    });
  });
});
