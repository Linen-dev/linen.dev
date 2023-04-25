/**
 * @jest-environment node
 */
import { create } from '@linen/factory';
import { attachHeaders, login } from '__tests__/pages/api/auth/login';
import { testApiHandler } from 'next-test-api-route-handler';
import { auths, prisma } from '@linen/database';
import handler from 'pages/api/accounts/[[...slug]]';
import { createAccountType } from './accounts.types';
import InviteToJoinMailer from 'mailers/InviteToJoinMailer';
import * as domain from '@linen/utilities/domain';

const host = 'http://localhost';
jest.mock('services/customerIo/trackEvents');
jest.spyOn(domain, 'getCurrentUrl').mockReturnValue(host);
const mockSend = jest.spyOn(InviteToJoinMailer, 'send').mockImplementation();
const random = () => 's' + (Math.random() + 1).toString(36).substring(2);
const randomEmail = () => random() + '@' + random() + '.com';

describe('accounts endpoints', () => {
  const store = {
    creds: { email: randomEmail(), password: random() },
    auth: {} as auths,
    token: '',
  };

  beforeAll(async () => {
    store.auth = await create('auth', {
      ...store.creds,
    });
    const response = await login({ ...store.creds });
    store.token = response.body.token;
  });

  test('create', async () => {
    await testApiHandler({
      handler: handler as any,
      url: '/api/accounts',
      test: async ({ fetch }: any) => {
        const body: createAccountType = {
          name: random(),
          members: [randomEmail(), randomEmail()],
          channels: [random()],
          slackDomain: random(),
        };

        const response = await fetch({
          method: 'POST',
          ...attachHeaders({ token: store.token }),
          body: JSON.stringify(body),
        });
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.id).toBeDefined();

        const newAccount = await prisma.accounts.findUnique({
          include: {
            invites: true,
            channels: true,
          },
          where: { id: result.id },
        });

        const inviter = store.creds.email.split('@').shift();

        expect(mockSend).toBeCalledTimes(2);
        expect(mockSend).toHaveBeenNthCalledWith(1, {
          communityName: body.name,
          host,
          to: body.members?.[0],
          inviterName: inviter,
        });
        expect(mockSend).toHaveBeenNthCalledWith(2, {
          communityName: body.name,
          host,
          to: body.members?.[1],
          inviterName: inviter,
        });

        expect(newAccount?.name).toBe(body.name);
        expect(newAccount?.slackDomain).toBe(body.slackDomain);
        expect(newAccount?.invites).toHaveLength(2);
        expect(newAccount?.channels).toHaveLength(2);
        expect(
          newAccount?.invites.find((i) => i.email === body.members?.[0])
        ).toBeDefined();
        expect(
          newAccount?.invites.find((i) => i.email === body.members?.[1])
        ).toBeDefined();
        expect(
          newAccount?.channels.find((i) => i.channelName === body.channels?.[0])
        ).toBeDefined();
        expect(
          newAccount?.channels.find((i) => i.channelName === 'default')
        ).toBeDefined();
      },
    });
  });
});
