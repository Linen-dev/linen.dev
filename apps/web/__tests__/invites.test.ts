/**
 * @jest-environment node
 */

import { createUser } from '__tests__/login';
import ApplicationMailer from 'mailers/ApplicationMailer';
import { eventNewThread } from '__mocks__/eventNewThreadMock';
import { invitesServices } from '__mocks__/invitesServicesMock';
import { updateInvitation } from 'services/invites';
import {
  accounts,
  AccountType,
  auths,
  prisma,
  users,
  Roles,
  channels,
  ChatType,
} from '@linen/database';
import { v4 } from 'uuid';
import { createAccount, createChannel } from '@linen/factory';
import handler from 'pages/api/invites';
import handlerAuth from 'pages/api/auth/[[...slug]]';
import handlerRouter from 'pages/api/router';
import handlerThreads from 'pages/api/threads/[[...slug]]';
import { testApiHandler } from 'next-test-api-route-handler';
import { createCSRFToken } from '@linen/auth/server';

const fakeEmail = () => `${v4()}@linen.dev`;

const acceptInviteMock = jest.spyOn(invitesServices, 'acceptInvite');

const eventNewThreadMock = jest
  .spyOn(eventNewThread, 'eventNewThread')
  .mockImplementation();

const mailerSendMock = jest
  .spyOn(ApplicationMailer, 'send')
  .mockImplementation();

function cleanMock() {
  acceptInviteMock.mockClear();
  eventNewThreadMock.mockClear();
  mailerSendMock.mockClear();
}

type storeType = {
  account: accounts;
  channel: channels;
  domain: {
    host: string;
    origin: string;
  };
  owner: {
    token: string;
    creds: { email: string; password: string };
    auth: auths;
    user: users;
  };
  invited: {
    email: string;
    signupLink: string;
    signinToken: string;
    token: string;
  };
};

describe('invite flow', () => {
  describe('custom domain + private community', () => {
    // on custom domain, private community
    const store: storeType = {} as any;

    beforeAll(async () => {
      const domain = `${v4()}.com`;
      store.domain = {
        host: domain,
        origin: `http://${domain}`,
      };
      store.account = await createAccount({
        type: AccountType.PRIVATE,
        chat: ChatType.MEMBERS,
      });
      store.channel = await createChannel({ accountId: store.account.id });
      store.owner = await createUser(store.account.id, Roles.OWNER);
      store.invited = { email: fakeEmail() } as any;

      cleanMock();
    });

    test('happy path', async () => {
      // given an owner/admin, it can create a invite for a new user
      await step1_createInvite(store);

      // signup email
      await step2_signUp(store);

      // user should be logged
      await step3_signIn(store);

      // should accept the invite
      const location = await step4_router(store);
      // it should redirect to /
      expect(location).toBe('/');

      // should have access to the private community
      await step5_postThread(store);
    });

    afterAll(() => {
      cleanMock();
    });
  });

  describe('under linen path domain', () => {
    const store: storeType = {} as any;

    beforeAll(async () => {
      const domain = `linen.dev`;
      store.domain = {
        host: domain,
        origin: `http://${domain}`,
      };
      store.account = await createAccount({
        type: AccountType.PUBLIC,
        chat: ChatType.MEMBERS,
        slackDomain: v4(),
      });
      store.channel = await createChannel({ accountId: store.account.id });
      store.owner = await createUser(store.account.id, Roles.OWNER);
      store.invited = { email: fakeEmail() } as any;

      cleanMock();
    });

    test('happy path', async () => {
      // given an owner/admin, it can create a invite for a new user
      await step1_createInvite(store);

      // signup email
      await step2_signUp(store);

      // user should be logged
      await step3_signIn(store);

      // should accept the invite
      const location = await step4_router(store);
      // it should redirect to /
      expect(location).toBe(`/s/${store.account.slackDomain}`);
      // should have access to the private community
      await step5_postThread(store);
    });

    afterAll(() => {
      cleanMock();
    });
  });
});

describe('invite service', () => {
  describe('update invite', () => {
    test('as admin, update invite from same tenant should succeed', async () => {
      const account = await prisma.accounts.create({ data: {} });
      const requester = await prisma.auths.create({
        data: {
          email: fakeEmail(),
          password: '',
          salt: '',
          account: { connect: { id: account.id } },
        },
      });
      const requesterUser = await prisma.users.create({
        data: {
          isAdmin: true,
          isBot: false,
          role: Roles.OWNER,
          account: { connect: { id: account.id } },
          auth: { connect: { id: requester.id } },
        },
      });
      const inviteToUpdate = await prisma.invites.create({
        data: {
          email: fakeEmail(),
          role: Roles.MEMBER,
          accounts: { connect: { id: account.id } },
          createdBy: { connect: { id: requesterUser.id } },
        },
      });
      await expect(
        updateInvitation({
          accountId: account.id,
          role: Roles.ADMIN,
          inviteId: inviteToUpdate.id,
        })
      ).resolves.toMatchObject({ status: 200, message: 'invitation updated' });
    });

    test.skip('as admin, update invite from distinct tenant should fail', async () => {});

    test.skip('as member, update an invite role should fail', async () => {});
  });
});

async function step1_createInvite(store: storeType) {
  let mockEmail: any;
  mailerSendMock.mockImplementationOnce((opts) => {
    mockEmail = opts;
    return Promise.resolve({} as any);
  });

  await testApiHandler({
    handler: handler,
    url: '/api/invites',
    test: async ({ fetch }) => {
      const response = await fetch({
        method: 'POST',
        body: JSON.stringify({
          communityId: store.account.id,
          email: store.invited.email,
          role: Roles.MEMBER,
        }),
        headers: {
          Authorization: `Bearer ${store.owner.token}`,
          Host: store.domain.host,
          Origin: store.domain.origin,
        },
      });
      expect(response.status).toEqual(200);

      expect(mailerSendMock).toBeCalled();
      expect(mockEmail).toBeDefined();

      // user will receive an signup email
      expect(mockEmail.text).toContain(
        `${store.domain.origin}/signup?email=${encodeURIComponent(
          store.invited.email
        )}`
      );
      store.invited.signupLink = `${
        store.domain.origin
      }/signup?email=${encodeURIComponent(store.invited.email)}`;
    },
  });

  mailerSendMock.mockClear();
}

async function step2_signUp(store: storeType) {
  let mockEmail2: any;
  mailerSendMock.mockImplementationOnce((opts) => {
    mockEmail2 = opts;
    return Promise.resolve({} as any);
  });

  const csrfToken = createCSRFToken();

  await testApiHandler({
    handler: handlerAuth as any,
    url: `/api/auth/magic-link`,
    test: async ({ fetch }) => {
      const response = await fetch({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Host: store.domain.host,
          Origin: store.domain.origin,
        },
        body: JSON.stringify({
          destination: String(store.invited.email).toLowerCase(),
          csrfToken,
          callbackUrl: '/api/router',
          displayName: 'cool-name',
          state: null,
        }),
      });

      expect(response.status).toEqual(200);

      expect(mailerSendMock).toBeCalledTimes(1);
      expect(mockEmail2).toBeDefined();

      // user will receive an signup email
      expect(mockEmail2.text).toContain(
        `${store.domain.origin}/api/auth/callback/magic-link?token=`
      );

      const token = String(mockEmail2.text)
        .split(/\/api\/auth\/callback\/magic-link\?token=/)
        .pop();
      expect(token).toBeDefined();

      store.invited.signinToken = token!;
    },
  });
}

async function step3_signIn(store: storeType) {
  await testApiHandler({
    handler: handlerAuth as any,
    url: `/api/auth/callback/magic-link?token=${store.invited.signinToken}`,
    test: async ({ fetch }) => {
      const response = await fetch({
        method: 'GET',
        redirect: 'manual',
      });

      expect(response.status).toEqual(307);
      expect(response.cookies).toBeDefined();
      const sessionCookie = response.cookies.find(
        (c) => !!c['linen.session-token']
      );
      expect(sessionCookie).toMatchObject({
        'linen.session-token': expect.any(String),
        Path: '/',
        path: '/',
        SameSite: 'Lax',
        samesite: 'Lax',
      });
      store.invited.token = sessionCookie!['linen.session-token'];

      expect(response.headers).toBeDefined();
      const location = response.headers.get('location');
      expect(location).toBeDefined();
      expect(location).toContain('/api/router');
    },
  });
}

async function step4_router(store: storeType) {
  let location: string = '';
  await testApiHandler({
    handler: handlerRouter,
    url: `/api/router`,
    test: async ({ fetch }) => {
      const response = await fetch({
        method: 'GET',
        redirect: 'manual',
        headers: {
          Authorization: `Bearer ${store.invited.token}`,
        },
      });

      expect(acceptInviteMock).toBeCalledTimes(1);
      expect(response.status).toEqual(307);
      expect(response.headers).toBeDefined();

      location = response.headers.get('location');
      expect(location).toBeDefined();
    },
  });
  return new URL(location).pathname;
}

async function step5_postThread(store: storeType) {
  await testApiHandler({
    handler: handlerThreads as any,
    url: `/api/threads`,
    test: async ({ fetch }) => {
      const response = await fetch({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${store.invited.token}`,
          Host: store.domain.host,
          Origin: store.domain.origin,
        },
        body: JSON.stringify({
          accountId: store.account.id,
          channelId: store.channel.id,
          body: 'hello',
        }),
      });
      expect(response.status).toEqual(200);
      expect(response.json()).resolves.toMatchObject({
        thread: expect.any(Object),
      });
      // expect(eventNewThreadMock).toBeCalledTimes(1);
    },
  });
}
