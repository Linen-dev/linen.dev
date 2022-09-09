import { AccountType, accounts } from '@prisma/client';
import { GetServerSidePropsContext } from 'next/types';
import Session from '../session';
import { findAccountByPath, findAccountByEmail } from 'lib/models';
import { Permissions } from 'types/shared';

export default class PermissionsService {
  static async get(context: GetServerSidePropsContext): Promise<Permissions> {
    const community = await findCommunity(context);
    const account = await findAccount(context);
    const access = PermissionsService._access(community, account);
    const inbox = PermissionsService._inbox(community, account);
    return {
      access,
      inbox,
    };
  }
  static _access(
    community: accounts | null,
    account: accounts | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (community.type === AccountType.PRIVATE) {
      if (!account || account.id !== community.id) {
        return false;
      }
    }
    return true;
  }

  static _inbox(community: accounts | null, account: accounts | null): boolean {
    if (!community) {
      return false;
    }
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
    return null;
  }
  return findAccountByPath(context.params.communityName);
}

async function findAccount(context: GetServerSidePropsContext) {
  const session = await Session.find(context);
  if (!session || !session.user || !session.user.email) {
    return null;
  }
  return findAccountByEmail(session.user.email);
}
