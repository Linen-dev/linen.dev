import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import { Session as SessionType } from 'next-auth';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export default class Session {
  static async find(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    response: GetServerSidePropsContext['res'] | NextApiResponse
  ): Promise<SessionType | null> {
    return unstable_getServerSession(request, response, authOptions);
  }
}
