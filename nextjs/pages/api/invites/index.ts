import { getCurrentUrl } from 'utilities/domain';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createInvitation, updateInvitation } from 'services/invites';
import PermissionsService from 'services/permissions';
import type { Roles } from '@prisma/client';

type Props = { communityId: string };

type PutProps = Props & {
  inviteId: string;
  role: Roles;
};

type PostProps = Props & {
  email: string;
  role: Roles;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const body = JSON.parse(request.body);
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: body.communityId,
    },
  });
  if (!permissions.manage) {
    return response.status(401).end();
  }

  const host = getCurrentUrl(request);

  if (request.method === 'POST') {
    const { communityId, email, role }: PostProps = body;
    const { status, message } = await createInvitation({
      accountId: communityId,
      email,
      host,
      createdByUserId: permissions.user?.id!,
      role,
    });
    response.status(status).json({ message });
    return response.end();
  }
  if (request.method === 'PUT') {
    const { communityId, role, inviteId }: PutProps = body;
    const { status, message } = await updateInvitation({
      accountId: communityId,
      inviteId,
      role,
    });
    response.status(status).json({ message });
    return response.end();
  }

  return response.status(405).end();
}
