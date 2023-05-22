import { getCurrentUrl } from '@linen/utilities/domain';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createInvitation, updateInvitation } from 'services/invites';
import PermissionsService from 'services/permissions';
import { Roles } from '@linen/types';
import { addHttpsToUrl } from '@linen/utilities/url';
import { cors, preflight } from 'utilities/cors';

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
  if (request.method === 'OPTIONS') {
    return preflight(request, response, ['POST', 'PUT']);
  }
  cors(request, response);

  const body = request.body;
  const permissions = await PermissionsService.get({
    request,
    response,
    params: {
      communityId: body.communityId,
    },
  });
  if (!permissions.manage) {
    return response.status(401).json({});
  }

  const host = addHttpsToUrl(
    request.headers.origin || request.headers.host || getCurrentUrl(request)
  );

  if (request.method === 'POST') {
    const { communityId, email, role }: PostProps = body;
    const emails = email.split(',').filter(Boolean);

    if (emails.length === 0) {
      return response.status(400).json({ error: 'Email is invalid' });
    }
    for (let i = 0, ilen = emails.length; i < ilen; i += 1) {
      const temp = emails[i];
      if (!temp.includes('@') || !temp.includes('.')) {
        return response.status(400).json({ error: 'Email is invalid' });
      }
    }

    await Promise.all(
      emails.map((email) => {
        return createInvitation({
          accountId: communityId,
          email,
          host,
          createdByUserId: permissions.user?.id!,
          role,
        });
      })
    );
    return response
      .status(200)
      .json({ message: `Invitation${emails.length === 1 ? '' : 's'} sent.` });
  }
  if (request.method === 'PUT') {
    const { communityId, role, inviteId }: PutProps = body;
    const { status, message } = await updateInvitation({
      accountId: communityId,
      inviteId,
      role,
    });
    return response.status(status).json({ message });
  }

  return response.status(405).json({});
}
