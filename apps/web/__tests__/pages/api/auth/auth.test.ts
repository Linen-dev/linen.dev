/**
 * @jest-environment node
 */

import { create } from '@linen/factory';
import { v4 } from 'uuid';
import { testApiHandler } from 'next-test-api-route-handler';
import handler from 'pages/api/auth/[[...slug]]';
import { login } from '__tests__/helpers';
import { createCSRFToken } from '@linen/auth-server/server';

type auths = {};

describe('auth routes', function () {
  let mockAuth: auths;
  let email = v4();
  let password = v4();

  beforeAll(async () => {
    mockAuth = await create('auth', { email, password });
  });

  it('it should create a fresh token', async function () {
    const response = await login({ email, password });
    expect(response.status).toEqual(200);
    expect(response.body.token).toBeDefined();
  });

  it('it should fail', async function () {
    const response = await login({ email, password: 'bad' });
    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('CredentialsSignin');
  });

  it('it should create a fresh token from a refreshToken', async function () {
    const response = await login({ email, password });
    expect(response.status).toEqual(200);
    expect(response.body.token).toBeDefined();

    let _token = response.body.token;

    // need to wait at least one second, otherwise the token will be the same
    // because the expiration timestamp will be the same
    await new Promise((r) => setTimeout(r, 1000));

    let _refreshedToken = '';
    let csrfToken = createCSRFToken();

    await testApiHandler({
      handler,
      url: '/api/auth/token',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({ csrfToken }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${_token}`,
          },
        });
        expect(response.status).toEqual(200);
        const body = await response.json();
        expect(body.token).not.toEqual(_token);
        _refreshedToken = body.token;
      },
    });

    await testApiHandler({
      handler,
      url: '/api/auth/session',
      test: async ({ fetch }: any) => {
        const response = await fetch({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${_refreshedToken}`,
          },
        });
        expect(response.status).toEqual(200);
        const body = await response.json();
        expect(email).toEqual(body.user.email);
      },
    });
  });
});
