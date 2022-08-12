import { generateRandomWordSlug } from 'utilities/randomWordSlugs';
import { auths, invites, Prisma } from '@prisma/client';
import InviteToJoinMailer from 'mailers/InviteToJoinMailer';
import prisma from '../client';

export async function createInvitation({
  requesterEmail,
  email,
  accountId,
  host,
}: {
  requesterEmail: string;
  email: string;
  accountId: string;
  host: string;
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
  users: auths[];
  invites: invites[];
}> {
  const users = await prisma.auths.findMany({
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
    return { status: 400, message: 'bad request, email mismatch' };
  }
  const auth = await prisma.auths.findUnique({ where: { email } });
  if (!auth) {
    return { status: 400, message: 'bad request, missing signup' };
  }
  const user = await prisma.users.findFirst({
    where: { accountsId: invite.accountsId, authsId: auth.id },
  });
  if (user) {
    return { status: 400, message: 'bad request, user already join' };
  }
  const displayName = email.split('@').shift() || email;

  await prisma.users.create({
    data: {
      isAdmin: true,
      isBot: false,
      account: { connect: { id: invite.accountsId } },
      auth: { connect: { id: auth.id } },
      anonymousAlias: generateRandomWordSlug(),
      displayName,
    },
  });
  // this step will be deprecated soon
  await prisma.auths.update({
    where: { email },
    data: { account: { connect: { id: invite.accountsId } } },
  });

  await prisma.invites.update({ where: { id }, data: { status: 'ACCEPTED' } });

  return { status: 200, message: 'invite accepted' };
}
