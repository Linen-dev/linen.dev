import { NextApiRequest, NextApiResponse } from 'next/types';
import Vercel from 'services/vercel';
import CommunityService from 'services/community';
import Permissions from 'services/permissions';
import { Permissions as PermissionsType } from '@linen/types';
import { cors, preflight } from 'utilities/cors';

export async function index({
  communityId,
  permissions,
}: {
  communityId: string;
  permissions: PermissionsType;
}) {
  if (!permissions.user || !permissions.manage) {
    return { status: 403 };
  }
  const community = await CommunityService.find({ communityId });

  if (!community) {
    return { status: 404 };
  }

  if (!community.premium || !community.redirectDomain) {
    return { status: 403 };
  }

  const response = await Vercel.findOrCreateDomainWithDnsRecords(
    community.redirectDomain
  );

  if (response.error) {
    return { status: 500 };
  }

  return { status: 200, data: { records: response.records } };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['GET']);
  }
  cors(request, response);
  if (request.method === 'GET') {
    const communityId = request.query.communityId as string;
    const permissions = await Permissions.get({
      request,
      response,
      params: { communityId },
    });

    const { status, data } = await index({ communityId, permissions });
    return response.status(status).json(data || {});
  }
  return response.status(405).end();
}
