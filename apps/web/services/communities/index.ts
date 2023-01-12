import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import Session from '../session';
import prisma from 'client';
import { accounts } from '@prisma/client';

export default class CommunitiesService {
  static async find(
    request: GetServerSidePropsContext['req'] | NextApiRequest,
    response: GetServerSidePropsContext['res'] | NextApiResponse
  ): Promise<accounts[]> {
    const auth = await Session.auth(request, response);
    if (!auth || auth.users.length <= 1) {
      return [];
    }
    return prisma.accounts.findMany({
      where: {
        id: {
          in: auth.users.map((user) => user.accountsId),
        },
      },
    });
  }
}
