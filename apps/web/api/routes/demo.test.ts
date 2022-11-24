import App from 'api/app';
import routes from 'api/routes';
import request from 'supertest';
import { create } from '__tests__/factory';
import { v4 } from 'uuid';
import type { accounts, auths, channels } from '@prisma/client';

const app = new App(routes).getServer();

describe('GET /api/v2/demo', function () {
  let mockAccount: accounts;
  let mockPrivateAccount: accounts;
  let email = v4();
  let emailAdmin = v4();
  let password = v4();
  let mockChannel: channels;

  beforeAll(async () => {
    mockAccount = await create('account', { slackDomain: v4() });
    mockChannel = await create('channel', {
      accountId: mockAccount.id,
      channelName: v4(),
      default: true,
    });

    mockPrivateAccount = await create('account', {
      slackDomain: v4(),
      type: 'PRIVATE',
    });
    await create('channel', {
      accountId: mockPrivateAccount.id,
      channelName: v4(),
      default: true,
    });

    let mockAuth: auths = await create('auth', { email, password });
    await create('user', {
      role: 'OWNER',
      accountsId: mockPrivateAccount.id,
      authsId: mockAuth.id,
    });

    let mockAuth2: auths = await create('auth', {
      email: emailAdmin,
      password,
    });
    await create('user', {
      role: 'ADMIN',
      accountsId: mockPrivateAccount.id,
      authsId: mockAuth2.id,
    });
  });

  it('it should get 400 due missing params', async function () {
    const response = await request(app)
      .get('/api/v2/demo')
      .set('Accept', 'application/json');
    expect(response.status).toEqual(400);
  });

  it('it should get 404 since community does not exist', async function () {
    const response = await request(app)
      .get('/api/v2/demo?' + new URLSearchParams({ communityName: 'NoExists' }))
      .set('Accept', 'application/json');
    expect(response.status).toEqual(404);
  });

  it('it should get 401 due missing auth header even for a public account', async function () {
    const response = await request(app).get(
      '/api/v2/demo?' +
        new URLSearchParams({ communityName: mockAccount.slackDomain! })
    );
    expect(response.status).toEqual(401);
  });

  it('it should get 401 due missing auth header', async function () {
    const response = await request(app).get(
      '/api/v2/demo?' +
        new URLSearchParams({
          communityName: mockPrivateAccount.slackDomain!,
        })
    );
    expect(response.status).toEqual(401);
  });

  it('it should get 403 with an admin account', async function () {
    const { body: login, status: loginStatus } = await request(app)
      .post('/api/v2/login')
      .send({ username: emailAdmin, password });
    expect(loginStatus).toEqual(200);
    expect(login.token).toBeDefined();
    expect(login.refreshToken).toBeDefined();

    const response = await request(app)
      .get(
        '/api/v2/demo?' +
          new URLSearchParams({
            communityName: mockPrivateAccount.slackDomain!,
          })
      )
      .set('Authorization', 'Bearer ' + login.token)
      .set('Accept', 'application/json');

    expect(response.status).toEqual(403);
  });

  it('it should get demo from private account with owner access', async function () {
    const { body: login, status: loginStatus } = await request(app)
      .post('/api/v2/login')
      .send({ username: email, password });
    expect(loginStatus).toEqual(200);
    expect(login.token).toBeDefined();
    expect(login.refreshToken).toBeDefined();

    const response = await request(app)
      .get(
        '/api/v2/demo?' +
          new URLSearchParams({
            communityName: mockPrivateAccount.slackDomain!,
          })
      )
      .set('Authorization', 'Bearer ' + login.token)
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body.role).toEqual('OWNER');
  });
});
