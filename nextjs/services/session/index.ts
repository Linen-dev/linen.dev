import { GetServerSidePropsContext } from 'next/types';
import { Session as SessionType } from 'next-auth';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export default class Session {
  static async find(
    context: GetServerSidePropsContext
  ): Promise<SessionType | null> {
    return unstable_getServerSession(context.req, context.res, authOptions);
  }
}
