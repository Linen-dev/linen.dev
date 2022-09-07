import { AccountType } from '@prisma/client';
import { GetServerSidePropsContext } from 'next/types';
import Session from '../session';
import { findAccountByPath, findAccountByEmail } from 'lib/models';

export default class PermissionsService {
  static async access(context: GetServerSidePropsContext): Promise<boolean> {
    const community = await findCommunity(context);
    if (!community) {
      return false;
    }
    if (community.type === AccountType.PRIVATE) {
      const account = await findAccount(context);
      if (!account || account.id !== community.id) {
        return false;
      }
    }
    return true;
  }

  static async inbox(context: GetServerSidePropsContext): Promise<boolean> {
    const community = await findCommunity(context);
    if (!community) {
      return false;
    }
    const account = await findAccount(context);
    if (!account || account.id !== community.id) {
      return false;
    }

    return true;
  }
}

async function findCommunity(context: GetServerSidePropsContext) {
  if (
    !context.params ||
    !context.params.communityName ||
    typeof context.params.communityName !== 'string'
  ) {
    return false;
  }
  return findAccountByPath(context.params.communityName);
}

async function findAccount(context: GetServerSidePropsContext) {
  const session = await Session.find(context);
  if (!session || !session.user || !session.user.email) {
    return false;
  }
  return findAccountByEmail(session.user.email);
}
