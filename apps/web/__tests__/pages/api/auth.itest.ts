import handler from 'pages/api/signup';
import { build } from '@linen/factory';
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendNotification } from 'services/slack';
import ApplicationMailer from 'mailers/ApplicationMailer';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'delete' });

jest.mock('services/slack');
jest.mock('mailers/ApplicationMailer');

describe('auth', () => {
  describe('#create', () => {
    it('creates a new auth', async () => {
      const request = build('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
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
      const request = build('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
          password: '123456',
        },
      }) as NextApiRequest;
      const response = build('response') as NextApiResponse;
      await handler(request, response);
      expect(sendNotification).toHaveBeenCalledWith(
        'Email created: john@doe.com'
      );
    });

    it.skip('sends a verification email', async () => {
      const request = build('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
          password: '123456',
        },
      }) as NextApiRequest;
      const response = build('response') as NextApiResponse;
      await handler(request, response);
      expect(ApplicationMailer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@doe.com',
          subject: 'Linen.dev - Verification email',
        })
      );
    });

    describe('when auth already exists', () => {
      it('returns a 200', async () => {
        const request = build('request', {
          method: 'POST',
          body: {
            email: 'john@doe.com',
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
        expect(response.json).toHaveBeenCalledWith({
          error: 'Please provide email',
        });
      });
    });

    describe('when password is missing', () => {
      it('returns an error', async () => {
        const request = build('request', {
          method: 'POST',
          body: {
            email: 'john@doe.com',
          },
        }) as NextApiRequest;
        const response = build('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
          error: 'Please provide password',
        });
      });
    });

    describe('when password has less than 6 characters', () => {
      it('returns an error', async () => {
        const request = build('request', {
          method: 'POST',
          body: {
            email: 'john@doe.com',
            password: '1234',
          },
        }) as NextApiRequest;
        const response = build('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
          error: 'Password too short',
        });
      });
    });
  });
});
