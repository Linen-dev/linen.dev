import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import { Session as SessionType } from 'next-auth';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import type { users } from '@prisma/client';
import { findAuthByEmail } from 'lib/users';

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
}
