import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { auths, invites, Prisma, Roles, users } from '@prisma/client';
import InviteToJoinMailer from 'mailers/InviteToJoinMailer';
import prisma from '../client';
import { normalize } from '@linen/utilities/string';
import PermissionsService from './permissions';
import { Unauthorized } from 'server/exceptions';

export async function createInvitation({
  createdByUserId,
  email,
  accountId,
  host,
  role,
}: {
  createdByUserId: string;
  email: string;
  accountId: string;
  host: string;
  role: Roles;
}) {
  const invite = await prisma.invites.create({
    select: {
      accounts: true,
      createdBy: { include: { auth: { select: { email: true } } } },
    },
    data: {
      email,
      accountsId: accountId,
      createdById: createdByUserId,
      role,
    },
  });

  await sendInvitationByEmail({
    email,
    host,
    communityName: (invite.accounts?.name ||
      invite.accounts?.discordDomain ||
      invite.accounts?.slackDomain)!,
    inviterName: (invite.createdBy?.displayName ||
      invite.createdBy?.auth?.email)!,
  });

  return { status: 200, message: 'invitation sent' };
}

async function sendInvitationByEmail({
  email,
  host,
  communityName,
  inviterName,
}: {
  communityName: string | null;
  email: string;
  host: string;
  inviterName: string;
}) {
  await InviteToJoinMailer.send({
    communityName,
    host,
    inviterName,
    to: email,
  });
}

export async function findUsersAndInvitesByAccount(id: string): Promise<{
  users: (users & {
    auth: auths | null;
  })[];
  invites: invites[];
}> {
  const users = await prisma.users.findMany({
    where: { accountsId: id, authsId: { not: null } },
    include: { auth: true },
  });

  const invites = await prisma.invites.findMany({
    where: { accountsId: id, status: 'PENDING' },
  });

  return { users, invites };
}

const getOneInviteByUserType = Prisma.validator<Prisma.invitesArgs>()({
  select: {
    accounts: {
      select: { name: true, discordDomain: true, slackDomain: true },
    },
    status: true,
    id: true,
    createdBy: {
      select: { displayName: true, auth: { select: { email: true } } },
    },
  },
});

export type GetOneInviteByUserType = Prisma.invitesGetPayload<
  typeof getOneInviteByUserType
>;

export async function getOneInviteByUser(
  email: string
): Promise<GetOneInviteByUserType | null> {
  return await prisma.invites.findFirst({
    select: {
      accounts: {
        select: { name: true, discordDomain: true, slackDomain: true },
      },
      status: true,
      id: true,
      createdBy: {
        select: { displayName: true, auth: { select: { email: true } } },
      },
    },
    where: {
      email,
      status: 'PENDING',
    },
  });
}

export async function acceptInvite(id: string, email: string) {
  const invite = await prisma.invites.findUnique({ where: { id } });
  if (invite?.email !== email) {
    throw { error: 'bad request, email mismatch' };
  }
  const auth = await prisma.auths.findUnique({ where: { email } });
  if (!auth) {
    throw { error: 'bad request, missing signup' };
  }
  const user = await prisma.users.findFirst({
    include: { account: true },
    where: { accountsId: invite.accountsId, authsId: auth.id },
  });
  if (user) {
    return user;
  }
  const displayName = email.split('@').shift() || email;

  const newUser = await prisma.users.create({
    include: { account: true },
    data: {
      isAdmin: invite.role === Roles.ADMIN,
      isBot: false,
      account: { connect: { id: invite.accountsId } },
      auth: { connect: { id: auth.id } },
      anonymousAlias: generateRandomWordSlug(),
      displayName,
      role: invite.role,
    },
  });
  // this step will be deprecated soon
  await prisma.auths.update({
    where: { email },
    data: { account: { connect: { id: invite.accountsId } } },
  });

  await prisma.invites.update({ where: { id }, data: { status: 'ACCEPTED' } });

  return newUser;
}

export async function updateInvitation({
  inviteId,
  role,
  accountId,
}: {
  inviteId: string;
  role: Roles;
  accountId: string;
}) {
  const invite = await prisma.invites.findUnique({ where: { id: inviteId } });
  if (!invite) {
    return { status: 404 };
  }
  if (!invite?.accountsId) {
    return { status: 403 };
  }
  if (invite?.accountsId !== accountId) {
    return { status: 403 };
  }

  await prisma.invites.update({
    where: {
      id: inviteId,
    },
    data: {
      role,
    },
  });

  return { status: 200, message: 'invitation updated' };
}

export async function findInvitesByEmail(
  email: string,
  params?: { accountsId?: string }
) {
  const where = {
    ...(params?.accountsId && { accountsId: params.accountsId }),
    email,
    status: 'PENDING',
  } as Prisma.invitesWhereInput;
  return await prisma.invites.findMany({
    where,
    select: {
      id: true,
      accounts: {
        select: {
          id: true,
          name: true,
          discordDomain: true,
          slackDomain: true,
        },
      },
    },
  });
}

export async function joinCommunity(
  email: string,
  accountId: string,
  authId: string
) {
  const user = await findUser(accountId, authId);
  if (!!user) {
    await checkoutTenant(authId, accountId);
    return { data: 'user already belongs to tenant' };
  }
  const displayName = normalize(email.split('@').shift() || email);
  await createUser(accountId, authId, displayName);
  await checkoutTenant(authId, accountId);
}

async function createUser(
  accountId: string,
  authId: string,
  displayName: string
) {
  await prisma.users.create({
    data: {
      isAdmin: false,
      isBot: false,
      accountsId: accountId,
      authsId: authId,
      displayName,
      anonymousAlias: generateRandomWordSlug(),
      role: Roles.MEMBER,
    },
  });
}

async function findUser(accountId: string, authId: string) {
  return await prisma.users.findFirst({
    where: {
      accountsId: accountId,
      authsId: authId,
    },
  });
}

async function checkoutTenant(authId: string, accountId: string) {
  await prisma.auths.update({ where: { id: authId }, data: { accountId } });
}

export async function joinAfterMagicLinkSignIn({
  request,
  response,
  communityId,
  authId,
  displayName,
}: {
  request: any;
  response: any;
  communityId: string;
  authId: string;
  displayName: string;
}) {
  const permissions = await PermissionsService.get({
    request,
    response,
    params: { communityId },
  });

  if (!permissions.access) {
    throw new Unauthorized();
  }
  await createUser(communityId, authId, displayName);
  await checkoutTenant(authId, communityId);
}
