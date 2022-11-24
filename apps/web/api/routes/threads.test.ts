import App from 'api/app';
import routes from 'api/routes';
import request from 'supertest';
import { create } from '__tests__/factory';
import { v4 } from 'uuid';
import type { accounts, auths, channels, threads } from '@prisma/client';

const app = new App(routes).getServer();

describe('GET /api/v2/threads', function () {
  let mockAccount: accounts;
  let mockPrivateAccount: accounts;
  let email = v4();
  let password = v4();
  let mockChannel: channels;
  let mockPrivateChannel: channels;

  beforeAll(async () => {
    mockAccount = await create('account', { slackDomain: v4() });
    mockChannel = await create('channel', {
      accountId: mockAccount.id,
      channelName: v4(),
      default: true,
    });
    await create('thread', { channelId: mockChannel.id });
    await create('thread', { channelId: mockChannel.id });

    mockPrivateAccount = await create('account', {
      slackDomain: v4(),
      type: 'PRIVATE',
    });
    mockPrivateChannel = await create('channel', {
      accountId: mockPrivateAccount.id,
      channelName: v4(),
      default: true,
    });
    await create('thread', { channelId: mockPrivateChannel.id });
    await create('thread', { channelId: mockPrivateChannel.id });

    let mockAuth: auths = await create('auth', { email, password });
    await create('user', {
      role: 'OWNER',
      accountsId: mockPrivateAccount.id,
      authsId: mockAuth.id,
    });
  });

  it('it should get 400 due missing params', async function () {
    const response = await request(app)
      .get('/api/v2/threads')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(400);
  });

  it('it should get 404', async function () {
    const response = await request(app)
      .get(
        '/api/v2/threads?' + new URLSearchParams({ communityName: 'NoExists' })
      )
      .set('Accept', 'application/json');

    expect(response.status).toEqual(404);
  });

  it('should get threads', async function () {
    const response = await request(app)
      .get(
        '/api/v2/threads?' +
          new URLSearchParams({ communityName: mockAccount.slackDomain! })
      )
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body.threads.length).toEqual(2);
    for (const thread of response.body.threads) {
      expect(thread.channelId).toEqual(mockChannel.id);
      expect(thread.hidden).toEqual(false);
    }
  });

  it('it should get 401', async function () {
    const response = await request(app)
      .get(
        '/api/v2/threads?' +
          new URLSearchParams({
            communityName: mockPrivateAccount.slackDomain!,
          })
      )
      .set('Accept', 'application/json');

    expect(response.status).toEqual(401);
  });

  it('it should get threads from private account', async function () {
    const { body: login, status: loginStatus } = await request(app)
      .post('/api/v2/login')
      .send({ username: email, password });
    expect(loginStatus).toEqual(200);
    expect(login.token).toBeDefined();
    expect(login.refreshToken).toBeDefined();

    const response = await request(app)
      .get(
        '/api/v2/threads?' +
          new URLSearchParams({
            communityName: mockPrivateAccount.slackDomain!,
          })
      )
      .set('Authorization', 'Bearer ' + login.token)
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body.threads.length).toEqual(2);
    for (const thread of response.body.threads) {
      expect(thread.channelId).toEqual(mockPrivateChannel.id);
      expect(thread.hidden).toEqual(false);
    }
  });
});
