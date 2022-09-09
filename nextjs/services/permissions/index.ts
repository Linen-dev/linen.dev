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
    const inbox = PermissionsService._inbox(community, account);
    return {
      access,
      inbox,
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
