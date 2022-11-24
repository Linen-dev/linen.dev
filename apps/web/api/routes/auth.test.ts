import App from 'api/app';
import routes from 'api/routes';
import request from 'supertest';
import { create } from '__tests__/factory';
import { v4 } from 'uuid';

const app = new App(routes).getServer();
type auths = {};

describe('auth routes', function () {
  let mockAuth: auths;
  let email = v4();
  let password = v4();

  beforeAll(async () => {
    mockAuth = await create('auth', { email, password });
  });

  it('it should create a fresh token', async function () {
    const response = await request(app)
      .post('/api/v2/login')
      .send({ username: email, password });

    expect(response.status).toEqual(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it('it should fail', async function () {
    const response = await request(app)
      .post('/api/v2/login')
      .send({ username: email, password: 'wrong pass' });
    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('Unauthorized');
  });

  it('it should create a fresh token from a refreshToken', async function () {
    const { body: login, status: loginStatus } = await request(app)
      .post('/api/v2/login')
      .send({ username: email, password });
    expect(loginStatus).toEqual(200);
    expect(login.token).toBeDefined();
    expect(login.refreshToken).toBeDefined();

    const { body: me, status: meStatus } = await request(app)
      .get('/api/v2/me')
      .set('Authorization', 'Bearer ' + login.token);
    expect(meStatus).toEqual(200);
    expect(email).toEqual(me.email);

    // need to wait at least one second, otherwise the token will be the same
    // because the expiration timestamp will be the same
    await new Promise((r) => setTimeout(r, 1000));

    const { body: refresh, status: refreshStatus } = await request(app)
      .post('/api/v2/token')
      .send({ refreshToken: login.refreshToken })
      .set('Authorization', 'Bearer ' + login.token);
    expect(refreshStatus).toEqual(200);
    expect(refresh.token).not.toEqual(login.token);
    expect(refresh.refreshToken).not.toEqual(login.refreshToken);

    const { body: me2, status: me2Status } = await request(app)
      .get('/api/v2/me')
      .set('Authorization', 'Bearer ' + refresh.token);
    expect(me2Status).toEqual(200);
    expect(email).toEqual(me2.email);
  });
});
