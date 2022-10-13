import {
  AccountType,
  auths,
  Roles,
  type accounts,
  type users,
} from '@prisma/client';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import Session from '../session';
import {
  type AccountWithPermissions,
  findAccountByPath,
  findAuthByEmail,
  accountWithPermissionsInclude,
} from 'lib/models';
import prisma from 'client';
import { Permissions } from 'types/shared';

type Request = GetServerSidePropsContext['req'] | NextApiRequest;
type Response = GetServerSidePropsContext['res'] | NextApiResponse;

interface Props {
  request: Request;
  response: Response;
  params: {
    communityId?: string;
    communityName?: string;
  };
}

export default class PermissionsService {
  static async get({ request, response, params }: Props): Promise<Permissions> {
    const [community, auth] = await Promise.all([
      findCommunity(params),
      findAuth(request, response),
    ]);
    const user = findUser(auth, community) || null;
    const account = user?.account || null;
    const access = PermissionsService._access(community, account);
    const chat = PermissionsService._chat(community);
    const feed = PermissionsService._feed(community);
    const is_member = PermissionsService._is_member(community, account, user);
    const manage = PermissionsService._manage(community, account, user);
    const channel_create = PermissionsService._channel_create(community, user);
    const permissions = {
      access,
      feed,
      chat,
      manage,
      is_member,
      channel_create,
      user: {
        id: user?.id || null,
        accountId: account?.id || null,
        authId: auth?.id || null,
        email: auth?.email || null,
      },
    };
    return permissions;
  }

  static async for(context: GetServerSidePropsContext) {
    return PermissionsService.get({
      request: context.req,
      response: context.res,
      params: context.params as any,
    });
  }

  static _manage(
    community: AccountWithPermissions | null,
    account: accounts | null,
    user: users | null
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
    community: AccountWithPermissions | null,
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

  static _feed(community: AccountWithPermissions | null): boolean {
    if (!community) {
      return false;
    }
    // TODO: this should be removed when feed is ready for all communities
    if (community?.discordAuthorizations?.length) {
      return false;
    }
    // TODO: this should be removed when feed is ready for all communities
    if (community?.slackAuthorizations?.length) {
      return false;
    }
    return true;
  }

  static _is_member(
    community: AccountWithPermissions | null,
    account: accounts | null,
    user: users | null
  ): boolean {
    if (!community) {
      return false;
    }
    return !!user && !!account;
  }

  static _channel_create(
    community: AccountWithPermissions | null,
    user: users | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (!user) {
      return false;
    }
    if (user.accountsId !== community.id) {
      return false;
    }

    if (community?.discordAuthorizations?.length) {
      return false;
    }
    if (community?.slackAuthorizations?.length) {
      return false;
    }

    if (user.role === Roles.ADMIN) return true;
    if (user.role === Roles.OWNER) return true;

    return false;
  }

  static _chat(community: AccountWithPermissions | null): boolean {
    if (!community) {
      return false;
    }
    if (community?.discordAuthorizations?.length) {
      return false;
    }
    if (community?.slackAuthorizations?.length) {
      const scope = community?.slackAuthorizations?.find(
        (integration) => integration?.scope?.indexOf('chat:write') > -1
      );
      if (!scope) {
        return false;
      }
    }

    return true;
  }

  static async getAccessChannel({
    request,
    response,
    channelId,
  }: Omit<Props, 'params'> & { channelId: string }) {
    const channel = await prisma.channels.findUnique({
      include: { account: true },
      where: { id: channelId },
    });
    const permissions = await PermissionsService.get({
      request,
      response,
      params: {
        communityId: channel?.account?.id!,
      },
    });
    return {
      ...permissions,
      can_access_channel: !!channel,
    };
  }

  static async getAccessThread({
    request,
    response,
    threadId,
  }: Omit<Props, 'params'> & { threadId: string }) {
    const thread = await prisma.threads.findUnique({
      include: { channel: { include: { account: true } } },
      where: { id: threadId },
    });
    const permissions = await PermissionsService.get({
      request,
      response,
      params: {
        communityId: thread?.channel?.account?.id!,
      },
    });
    return {
      ...permissions,
      can_access_thread: !!thread,
    };
  }
}

async function findCommunity(params: any) {
  if (params && params.communityId && typeof params.communityId === 'string') {
    return prisma.accounts.findFirst({
      ...accountWithPermissionsInclude,
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

function findUser(
  auth:
    | (auths & {
        users: (users & {
          account: accounts;
        })[];
      })
    | null,
  community: AccountWithPermissions | null
) {
  if (!community) {
    return null;
  }
  return auth?.users.find((u) => u.accountsId === community.id);
}

async function findAuth(request: Request, response: Response) {
  const session = await Session.find(request, response);
  if (!session || !session.user || !session.user.email) {
    return null;
  }
  return findAuthByEmail(session.user.email);
}
