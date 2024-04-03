/**
 * @jest-environment node
 */

import handler from 'pages/api/signup';
import { build } from '@linen/factory-client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendNotification } from 'services/slack';
import { v4 } from 'uuid';
jest.mock('services/slack');
jest.mock('mailers/ApplicationMailer');

const randomEmail = () => `${v4()}@${v4()}.com`;

describe('auth', () => {
  describe('#create', () => {
    it('creates a new auth', async () => {
      const email = randomEmail();
      const request = build('request', {
        method: 'POST',
        body: {
          email,
          password: '123456',
        },
      }) as NextApiRequest;
      const response = build('response') as NextApiResponse;
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Account created, please sign in!',
      });
    });

    it('sends a notification', async () => {
      sendNotification.mockClear();
      const email = randomEmail();
      const request = build('request', {
        method: 'POST',
        body: {
          email,
          password: '123456',
        },
      }) as NextApiRequest;
      const response = build('response') as NextApiResponse;
      await handler(request, response);
      expect(sendNotification).toHaveBeenCalledWith(`User ${email} signed up`);
    });

    describe('when auth already exists', () => {
      it('returns a 200', async () => {
        const email = randomEmail();
        const request = build('request', {
          method: 'POST',
          body: {
            email,
            password: '123456',
          },
        }) as NextApiRequest;
        const response = build('response') as NextApiResponse;
        await handler(request, response);
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
          message: 'Account exists, please sign in!',
        });
      });
    });

    describe('when email is missing', () => {
      it('returns an error', async () => {
        const request = build('request', {
          method: 'POST',
        }) as NextApiRequest;
        const response = build('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json.mock.lastCall).toMatchInlineSnapshot(`
                  [
                    {
                      "error": [ZodError: [
                    {
                      "code": "invalid_type",
                      "expected": "string",
                      "received": "undefined",
                      "path": [
                        "email"
                      ],
                      "message": "Required"
                    },
                    {
                      "code": "invalid_type",
                      "expected": "string",
                      "received": "undefined",
                      "path": [
                        "password"
                      ],
                      "message": "Required"
                    }
                  ]],
                    },
                  ]
                `);
      });
    });

    describe('when password is missing', () => {
      it('returns an error', async () => {
        const request = build('request', {
          method: 'POST',
          body: {
            email: randomEmail(),
          },
        }) as NextApiRequest;
        const response = build('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json.mock.lastCall).toMatchInlineSnapshot(`
                  [
                    {
                      "error": [ZodError: [
                    {
                      "code": "invalid_type",
                      "expected": "string",
                      "received": "undefined",
                      "path": [
                        "password"
                      ],
                      "message": "Required"
                    }
                  ]],
                    },
                  ]
                `);
      });
    });

    describe('when password has less than 6 characters', () => {
      it('returns an error', async () => {
        const request = build('request', {
          method: 'POST',
          body: {
            email: randomEmail(),
            password: '1234',
          },
        }) as NextApiRequest;
        const response = build('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json.mock.lastCall).toMatchInlineSnapshot(`
          [
            {
              "error": [ZodError: [
            {
              "code": "too_small",
              "minimum": 6,
              "type": "string",
              "inclusive": true,
              "exact": false,
              "message": "String must contain at least 6 character(s)",
              "path": [
                "password"
              ]
            }
          ]],
            },
          ]
        `);
      });
    });
  });
});
