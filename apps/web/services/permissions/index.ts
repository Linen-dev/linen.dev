import { auths, type accounts, type users, prisma } from '@linen/database';
import { AccountType, ChatType, Permissions, Roles } from '@linen/types';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import Session from '../session';
import { findAccountByPath } from 'services/accounts';
import { findAuthByEmail } from 'services/users';
import { serializeUser } from '@linen/serializers/user';

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
    const [community, auth, token] = await Promise.all([
      findCommunity(params),
      findAuth(request, response),
      Session.tokenRaw(request),
    ]);
    const user = findUser(auth, community) || null;
    const account = user?.account || null;
    const access = PermissionsService._access(community, account);
    const chat = PermissionsService._chat(community, user);
    const inbox = PermissionsService._inbox(community, user);
    const starred = PermissionsService._starred(community, user);
    const is_member = PermissionsService._is_member(community, account, user);
    const manage = PermissionsService._manage(community, account, user);
    const channel_create = PermissionsService._channel_create(community, user);
    const permissions = {
      access,
      inbox,
      starred,
      chat,
      manage,
      is_member,
      channel_create,
      accountId: community?.id || null,
      auth: auth
        ? {
            email: auth.email,
            id: auth.id,
          }
        : null,
      token: token || null,
      user: user ? serializeUser(user) : null,
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
    community: accounts | null,
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
    community: accounts | null,
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

  static _inbox(community: accounts | null, user: users | null): boolean {
    if (!community) {
      return false;
    }
    if (!user) {
      return false;
    }
    return true;
  }

  static _starred(community: accounts | null, user: users | null): boolean {
    if (!community) {
      return false;
    }
    if (!user) {
      return false;
    }
    return true;
  }

  static _is_member(
    community: accounts | null,
    account: accounts | null,
    user: users | null
  ): boolean {
    if (!community) {
      return false;
    }
    return !!user && !!account;
  }

  static _channel_create(
    community: accounts | null,
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

    // if (community?.integration === AccountIntegration.DISCORD) {
    //   return false;
    // }
    // if (community?.integration === AccountIntegration.SLACK) {
    //   return false;
    // }

    if (user.role === Roles.ADMIN) return true;
    if (user.role === Roles.OWNER) return true;

    return false;
  }

  static _chat(community: accounts | null, user: users | null): boolean {
    if (!community) {
      return false;
    }
    if (community.chat === ChatType.NONE) {
      return false;
    }
    if (community.chat === ChatType.MANAGERS) {
      if (user?.role === Roles.ADMIN) return true;
      if (user?.role === Roles.OWNER) return true;
      return false;
    }
    if (community.chat === ChatType.MEMBERS) {
      if (!!user?.role) return true;
      return false;
    }
    return false;
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
  community: accounts | null
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
