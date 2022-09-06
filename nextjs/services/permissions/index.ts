import { AccountType } from '@prisma/client';
import { GetServerSidePropsContext } from 'next/types';
import Session from '../session';
import prisma from 'client';
import { findAccountByEmail } from 'lib/models';

export default class PermissionsService {
  static async access(context: GetServerSidePropsContext): Promise<boolean> {
    if (
      !context.params ||
      !context.params.communityName ||
      typeof context.params.communityName !== 'string'
    ) {
      return false;
    }
    const community = await prisma.accounts.findFirst({
      where: { name: context.params.communityName },
    });
    if (!community) {
      return false;
    }
    if (community.type === AccountType.PRIVATE) {
      const session = await Session.find(context);
      if (!session || !session.user || !session.user.email) {
        return false;
      }
      const account = await findAccountByEmail(session.user.email);
      if (!account) {
        return false;
      }
      if (account.id !== community.id) {
        return false;
      }
    }
    return true;
  }
}
