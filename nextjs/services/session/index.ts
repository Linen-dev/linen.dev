import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import type { Session as SessionType } from 'next-auth';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import type { users } from '@prisma/client';
import { findAuthByEmail } from 'lib/users';
export { type SessionType };
import { getToken, type JWT } from 'next-auth/jwt';
import prisma from 'client';

export default class Session {
  static async find(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    response: GetServerSidePropsContext['res'] | NextApiResponse
  ): Promise<SessionType | null> {
    return unstable_getServerSession(request, response, authOptions);
  }

  static async user(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    response: GetServerSidePropsContext['res'] | NextApiResponse
  ): Promise<users | null> {
    const session = await Session.find(request, response);
    if (session && session.user && session.user.email) {
      const auth = await findAuthByEmail(session.user.email);
      if (auth) {
        return (
          auth.users.find(
            (user: users) => user.accountsId === auth.accountId
          ) || null
        );
      }
    }
    return null;
  }

  static async token(
    req: GetServerSidePropsContext['req'] | NextApiRequest
  ): Promise<JWT | null> {
    return getToken({ req });
  }

  static async tokenRaw(
    req: GetServerSidePropsContext['req'] | NextApiRequest
  ): Promise<string | null> {
    return getToken({ req, raw: true });
  }

  static async canAuthAccessChannel(authId: string, channelId: string) {
    return await prisma.auths.findFirst({
      where: {
        id: authId,
        users: {
          some: {
            account: { channels: { some: { id: channelId } } },
          },
        },
      },
    });
  }

  static async canAuthAccessCommunity(authId: string, communityId: string) {
    return await prisma.auths.findFirst({
      where: {
        id: authId,
        users: {
          some: {
            account: { id: communityId },
          },
        },
      },
    });
  }

  static async canAuthAccessThread(authId: string, threadId: string) {
    return await prisma.auths.findFirst({
      where: {
        id: authId,
        users: {
          some: {
            account: {
              channels: { some: { threads: { some: { id: threadId } } } },
            },
          },
        },
      },
    });
  }
}
