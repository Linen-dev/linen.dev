import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import type { Session as SessionType, JWT } from 'utilities/auth/types';
import { users, prisma } from '@linen/database';
import { findAuthByEmail } from 'services/users';
export { type SessionType };
import {
  getServerSession,
  getRawTokenFromRequest,
  getValidSessionTokenFromRequest,
} from 'utilities/auth/server/session';

export default class Session {
  static async find(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    _?: any
  ): Promise<SessionType | null> {
    return getServerSession(request);
  }

  static async user(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    _?: any
  ): Promise<users | null> {
    const session = await Session.find(request);
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

  static async auth(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    response: GetServerSidePropsContext['res'] | NextApiResponse
  ) {
    const session = await Session.find(request, response);
    if (session && session.user && session.user.email) {
      return findAuthByEmail(session.user.email);
    }
    return null;
  }

  static async token(
    req: GetServerSidePropsContext['req'] | NextApiRequest
  ): Promise<JWT | null> {
    return getValidSessionTokenFromRequest(req);
  }

  static async tokenRaw(
    req: GetServerSidePropsContext['req'] | NextApiRequest
  ): Promise<string | null> {
    return getRawTokenFromRequest(req);
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
