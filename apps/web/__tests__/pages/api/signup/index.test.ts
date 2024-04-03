/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler';
import handler from 'pages/api/signup';

describe('sign up endpoint', () => {
  test('invalid email + password too short >> 400', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            email: 'random',
            password: '1',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(response.status).toEqual(400);
        expect(response.json()).resolves.toEqual({
          error: {
            issues: [
              {
                code: 'invalid_string',
                message: 'Invalid email',
                path: ['email'],
                validation: 'email',
              },
              {
                code: 'too_small',
                exact: false,
                inclusive: true,
                message: 'String must contain at least 6 character(s)',
                minimum: 6,
                path: ['password'],
                type: 'string',
              },
            ],
            name: 'ZodError',
          },
        });
      },
    });
  });

  test('password too short >> 400', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            email: 'random@random.com',
            password: '1',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(response.status).toEqual(400);
        expect(response.json()).resolves.toEqual({
          error: {
            issues: [
              {
                code: 'too_small',
                exact: false,
                inclusive: true,
                message: 'String must contain at least 6 character(s)',
                minimum: 6,
                path: ['password'],
                type: 'string',
              },
            ],
            name: 'ZodError',
          },
        });
      },
    });
  });

  test('accountId is not uuid >> 400', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            email: 'random@random.com',
            password: '123456',
            accountId: 'hi',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(response.status).toEqual(400);
        expect(response.json()).resolves.toEqual({
          error: {
            issues: [
              {
                code: 'invalid_string',
                message: 'Invalid uuid',
                path: ['accountId'],
                validation: 'uuid',
              },
            ],
            name: 'ZodError',
          },
        });
      },
    });
  });

  test('displayName empty >> 400', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }: any) => {
        const response = await fetch({
          method: 'POST',
          body: JSON.stringify({
            email: 'random@random.com',
            password: '123456',
            displayName: '',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(response.status).toEqual(400);
        expect(response.json()).resolves.toEqual({
          error: {
            issues: [
              {
                code: 'too_small',
                minimum: 1,
                type: 'string',
                inclusive: true,
                exact: false,
                message: 'String must contain at least 1 character(s)',
                path: ['displayName'],
              },
            ],
            name: 'ZodError',
          },
        });
      },
    });
  });
});
