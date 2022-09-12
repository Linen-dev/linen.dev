import { AccountType, accounts } from '@prisma/client';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import Session from '../session';
import { findAccountByPath, findAccountByEmail } from 'lib/models';
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
    const account = await findAccount(request, response);
    const access = PermissionsService._access(community, account);
    const sendMessage = PermissionsService._sendMessage(community, account);
    const feed = PermissionsService._feed(community, account);
    return {
      access,
      feed,
      sendMessage,
    };
  }

  static async for(context: GetServerSidePropsContext) {
    return PermissionsService.get({
      request: context.req,
      response: context.res,
      params: context.params,
    });
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

  static _feed(community: accounts | null, account: accounts | null): boolean {
    if (!community) {
      return false;
    }
    if (!account || account.id !== community.id) {
      return false;
    }

    return true;
  }

  //Todo: Check roles and check if they have permissions to post to channel
  static _sendMessage(
    community: accounts | null,
    account: accounts | null
  ): boolean {
    if (!community) {
      return false;
    }
    if (!account || account.id !== community.id) {
      return false;
    }

    return true;
  }
}

async function findCommunity(params: any) {
  if (
    !params ||
    !params.communityName ||
    typeof params.communityName !== 'string'
  ) {
    return null;
  }
  return findAccountByPath(params.communityName);
}

async function findAccount(request: Request, response: Response) {
  const session = await Session.find(request, response);
  if (!session || !session.user || !session.user.email) {
    return null;
  }
  return findAccountByEmail(session.user.email);
}
