import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { auths, invites, Prisma, Roles, users } from '@prisma/client';
import InviteToJoinMailer from 'mailers/InviteToJoinMailer';
import prisma from '../client';

export async function createInvitation({
  requesterEmail,
  email,
  accountId,
  host,
  role,
}: {
  requesterEmail: string;
  email: string;
  accountId: string;
  host: string;
  role: Roles;
}) {
  const requester = await prisma.auths.findUnique({
    where: { email: requesterEmail },
    include: { account: true, users: true },
  });

  if (requester?.accountId !== accountId) {
    return { status: 403, message: 'forbidden' };
  }

  if (!requester.account?.id) {
    return { status: 404, message: 'account not found' };
  }

  const user = requester.users.find((user) => user.accountsId === accountId);
  if (!user) {
    return { status: 404, message: 'user not found' };
  }

  await prisma.invites.create({
    data: {
      email,
      accountsId: accountId,
      createdById: user.id,
      role,
    },
  });

  await sendInvitationByEmail({
    email,
    host,
    communityName:
      requester.account?.name ||
      requester.account?.discordDomain ||
      requester.account?.slackDomain,
    inviterName: user.displayName || requester.email,
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
  users: (auths & {
    users: users[];
  })[];
  invites: invites[];
}> {
  const users = await prisma.auths.findMany({
    include: { users: true },
    where: { users: { some: { accountsId: id } } },
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
      isAdmin: invite.role === 'ADMIN',
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
  requesterEmail,
  userId,
  role,
}: {
  requesterEmail: string;
  userId: string;
  role: Roles;
}) {
  const requester = await prisma.auths.findUnique({
    where: { email: requesterEmail },
    include: { account: true, users: true },
  });

  const invite = await prisma.invites.findUnique({ where: { id: userId } });

  const user = requester?.users.find(
    (user) => user.accountsId === invite?.accountsId
  );
  if (!user) {
    return { status: 404, message: 'user not found' };
  }
  const userFromSession = requester?.users.find(
    (u) => u.accountsId === user.accountsId
  );
  if (!userFromSession) {
    return { status: 404, message: "user doesn't belong to same tenant" };
  }
  // user requester should be an owner or admin
  if (
    userFromSession.role !== Roles.ADMIN &&
    userFromSession.role !== Roles.OWNER
  ) {
    return {
      status: 404,
      message: 'requester is not authorized to make this change',
    };
  }

  await prisma.invites.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  return { status: 200, message: 'invitation updated' };
}
