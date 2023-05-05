import { NextApiRequest, NextApiResponse } from 'next/types';
import { auths, invites, users, Roles } from '@linen/database';
import { findUsersAndInvitesByAccount } from 'services/invites';
import CommunityService from 'services/community';
import Permissions from 'services/permissions';
import { Permissions as PermissionsType } from '@linen/types';
import { cors, preflight } from 'utilities/cors';

interface MembersType {
  id: string;
  email: string | null;
  role: Roles;
  status: 'PENDING' | 'ACCEPTED' | 'UNKNOWN' | string;
  displayName: string | null;
  profileImageUrl: string | null;
}

function serializeUsers(
  users: (users & {
    auth: auths | null;
  })[],
  invites: invites[]
): MembersType[] {
  return users.map(userToMember).concat(invites.map(inviteToMember));
}

function userToMember(
  user: users & {
    auth: auths | null;
  }
): MembersType {
  return {
    id: user.id,
    email: user.auth?.email || user.displayName,
    role: user.role,
    status: 'ACCEPTED',
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
  };
}

function inviteToMember({ email, status, role, id }: invites): MembersType {
  return {
    id,
    email,
    role,
    status,
    displayName: null,
    profileImageUrl: null,
  };
}

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

  const { users, invites } = await findUsersAndInvitesByAccount(community.id);

  return { status: 200, data: { users: serializeUsers(users, invites) } };
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
  return response.status(405).json({});
}
