import handler from '../../../pages/api/auth';
import { create } from '../../factory';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../client';
import { sendNotification } from '../../../services/slack';
import ApplicationMailer from '../../../mailers/ApplicationMailer';

jest.mock('../../../client');
jest.mock('../../../services/slack');
jest.mock('../../../mailers/ApplicationMailer');
jest.mock('../../../utilities/token', () => ({
  generateToken() {
    return '1234';
  },
}));

describe('auth', () => {
  describe('#create', () => {
    it('creates a new auth', async () => {
      const request = create('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
          password: '123456',
        },
      }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
      await handler(request, response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        message:
          "We've sent you a verification email. Please check your inbox.",
      });
    });

    it('sends a notification', async () => {
      const request = create('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
          password: '123456',
        },
      }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
      await handler(request, response);
      expect(sendNotification).toHaveBeenCalledWith(
        'Email created: john@doe.com'
      );
    });

    it('creates a verification token', async () => {
      const request = create('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
          password: '123456',
        },
      }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
      await handler(request, response);
      expect(prisma.auths.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ verificationToken: '1234' }),
      });
    });

    it('sends a verification email', async () => {
      const request = create('request', {
        method: 'POST',
        body: {
          email: 'john@doe.com',
          password: '123456',
        },
      }) as NextApiRequest;
      const response = create('response') as NextApiResponse;
      (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
      await handler(request, response);
      expect(ApplicationMailer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@doe.com',
          subject: 'Linen - Verify your email',
        })
      );
    });

    describe('when auth already exists', () => {
      describe('when the account is already verified', () => {
        it('returns a sign in message', async () => {
          const request = create('request', {
            method: 'POST',
            body: {
              email: 'john@doe.com',
              password: '123456',
            },
          }) as NextApiRequest;
          const response = create('response') as NextApiResponse;
          (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
          await handler(request, response);
          (prisma.auths.findFirst as jest.Mock).mockResolvedValue({
            verified: true,
          });
          await handler(request, response);
          expect(response.status).toHaveBeenCalledWith(200);
          expect(response.json).toHaveBeenCalledWith({
            message: 'Account exists, please sign in!',
          });
        });
      });

      describe('when the account is not verified yet', () => {
        it('returns a sign in message', async () => {
          const request = create('request', {
            method: 'POST',
            body: {
              email: 'john@doe.com',
              password: '123456',
            },
          }) as NextApiRequest;
          const response = create('response') as NextApiResponse;
          (prisma.auths.findFirst as jest.Mock).mockResolvedValue(null);
          await handler(request, response);
          (prisma.auths.findFirst as jest.Mock).mockResolvedValue({
            verified: false,
          });
          await handler(request, response);
          expect(response.status).toHaveBeenCalledWith(200);
          expect(response.json).toHaveBeenCalledWith({
            message: 'Account exists, please verify your email!',
          });
        });
      });
    });

    describe('when email is missing', () => {
      it('returns an error', async () => {
        const request = create('request', {
          method: 'POST',
        }) as NextApiRequest;
        const response = create('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
          error: 'Please provide email',
        });
      });
    });

    describe('when password is missing', () => {
      it('returns an error', async () => {
        const request = create('request', {
          method: 'POST',
          body: {
            email: 'john@doe.com',
          },
        }) as NextApiRequest;
        const response = create('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
          error: 'Please provide password',
        });
      });
    });

    describe('when password has less than 6 characters', () => {
      it('returns an error', async () => {
        const request = create('request', {
          method: 'POST',
          body: {
            email: 'john@doe.com',
            password: '1234',
          },
        }) as NextApiRequest;
        const response = create('response') as NextApiResponse;
        await handler(request, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({
          error: 'Password too short',
        });
      });
    });
  });
});
