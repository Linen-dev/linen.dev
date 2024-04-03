/**
 * @jest-environment node
 */

import { accounts, AccountType, users } from '@linen/database';
import {
  createAccount,
  createChannel,
  createThread,
  createMessage,
  createUser,
} from '@linen/factory';
import handlerSearch from 'pages/api/search';
import { testApiHandler } from 'next-test-api-route-handler';
import { qs } from '@linen/utilities/url';

function cleanMock() {}

type storeType = {
  account: accounts;
  user: users;
};

describe('search', () => {
  describe('anonymous community', () => {
    const store: storeType = {} as any;

    beforeAll(async () => {
      store.account = await createAccount({
        type: AccountType.PUBLIC,
        anonymizeUsers: true,
      });
      const channel = await createChannel({
        accountId: store.account.id,
        hidden: false,
      });
      store.user = await createUser({
        accountsId: store.account.id,
        displayName: 'cool-name',
        anonymousAlias: 'hidden-name',
      });
      const thread = await createThread({ channelId: channel.id });
      await createMessage({
        body: 'test',
        channelId: channel.id,
        threadId: thread.id,
        usersId: store.user.id,
      });

      await createMessage({
        body: `hello @${store.user.id}`,
        channelId: channel.id,
        threadId: thread.id,
        usersId: store.user.id,
        mentions: {
          createMany: { data: [{ usersId: store.user.id }] },
        },
      } as any);

      cleanMock();
    });

    test('author information should be hidden', async () => {
      await testApiHandler({
        handler: handlerSearch,
        url: `/api/search?${qs({
          accountId: store.account.id,
          query: 'test',
          limit: 1,
          offset: 0,
        })}`,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });
          expect(response.status).toEqual(200);
          const body = await response.json();
          expect(body).toHaveLength(1);
          expect(body[0].author.displayName).toBe(store.user.anonymousAlias);
          expect(body[0].author.username).toBe(store.user.anonymousAlias);
          expect(body[0].author.profileImageUrl).toBe(null);
        },
      });
    });

    test('mentioned user should be hidden', async () => {
      await testApiHandler({
        handler: handlerSearch,
        url: `/api/search?${qs({
          accountId: store.account.id,
          query: 'hello',
          limit: 1,
          offset: 0,
        })}`,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });
          expect(response.status).toEqual(200);
          const body = await response.json();
          expect(body).toHaveLength(1);
          expect(body[0].author.displayName).toBe(store.user.anonymousAlias);
          expect(body[0].author.username).toBe(store.user.anonymousAlias);
          expect(body[0].author.profileImageUrl).toBe(null);

          expect(body[0].mentions).toHaveLength(1);
          const mention = body[0].mentions[0];
          expect(mention.displayName).toBe(store.user.anonymousAlias);
          expect(mention.username).toBe(store.user.anonymousAlias);
          expect(mention.profileImageUrl).toBe(null);
        },
      });
    });

    afterAll(() => {
      cleanMock();
    });
  });
});
