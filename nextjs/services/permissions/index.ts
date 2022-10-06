import { AccountType, Roles, type accounts, type users } from '@prisma/client';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import Session from '../session';
import {
  type AccountWithFeatureFlag,
  findAccountByPath,
  findUserAndAccountByIdAndEmail,
} from 'lib/models';
import prisma from 'client';
import { Permissions } from 'types/shared';

type Request = GetServerSidePropsContext['req'] | NextApiRequest;
type Response = GetServerSidePropsContext['res'] | NextApiResponse;

interface Props {
  request: Request;
  response: Response;
  params: any;
}

export default class PermissionsService {
  static async get({ request, response, params }: Props): Promise<Permissions> {
    const community = await findCommunity(params);
    const user = await findAccount(request, response, community);
    const account = user?.account || null;
    const access = PermissionsService._access(community, account);
    const chat = PermissionsService._chat(community, account);
    const feed = PermissionsService._feed(community, account);
    const manage = PermissionsService._manage(community, account, user);
    const channel_create = PermissionsService._channel_create(
      community,
      account,
      user
    );
    return {
      access,
      feed,
      chat,
      manage,
      channel_create,
    };
  }

  static async for(context: GetServerSidePropsContext) {
    return PermissionsService.get({
      request: context.req,
      response: context.res,
      params: context.params,
    });
  }

  static _manage(
    community: AccountWithFeatureFlag | null,
    account: accounts | null,
    user:
      | (users & {
          account: accounts;
        })
      | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (!account || account.id !== community.id) {
      return false;
    }

    if (!user) {
      return false;
    }
    return user.role === Roles.ADMIN || user.role === Roles.OWNER;
  }

  static _access(
    community: AccountWithFeatureFlag | null,
    account: accounts | null
  ): boolean {
    if (!community) {
      return true;
    }
    if (community.type === AccountType.PRIVATE) {
      if (!account || account.id !== community.id) {
        return false;
      }
    }
    return true;
  }

  static _feed(
    community: AccountWithFeatureFlag | null,
    account: accounts | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (!account || account.id !== community.id) {
      return false;
    }
    if (community.featureFlags) {
      return community.featureFlags.isFeedEnabled;
    }
    return false;
  }

  static _channel_create(
    community: AccountWithFeatureFlag | null,
    account: accounts | null,
    user:
      | (users & {
          account: accounts;
        })
      | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (!account || account.id !== community.id) {
      return false;
    }
    if (
      community.featureFlags &&
      community.featureFlags.isCreateChannelEnabled
    ) {
      if (user && user.role) {
        if (user.role === Roles.ADMIN) return true;
        if (user.role === Roles.OWNER) return true;
      }
    }

    return false;
  }

  //Todo: Check roles and check if they have permissions to post to channel
  static _chat(
    community: AccountWithFeatureFlag | null,
    account: accounts | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (!account || account.id !== community.id) {
      return false;
    }
    if (community.featureFlags) {
      return community.featureFlags.isChatEnabled;
    }
    return false;
  }
}

async function findCommunity(params: any) {
  if (params && params.communityId && typeof params.communityId === 'string') {
    return prisma.accounts.findFirst({
      include: { featureFlags: true },
      where: { id: params.communityId },
    });
  }
  if (
    params &&
    params.communityName &&
    typeof params.communityName === 'string'
  ) {
    return findAccountByPath(params.communityName);
  }
  return null;
}

async function findAccount(
  request: Request,
  response: Response,
  community: AccountWithFeatureFlag | null
) {
  if (!community) {
    return null;
  }
  const session = await Session.find(request, response);
  if (!session || !session.user || !session.user.email) {
    return null;
  }
  return findUserAndAccountByIdAndEmail(community.id, session.user.email);
}
