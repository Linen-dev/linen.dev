import prisma from '../client';
import { v4 } from 'uuid';
import { AccountType, Roles } from '@prisma/client';
import { createInvitation } from './invites';
import { createAccountEvent } from './customerIo/trackEvents';

export async function OnboardingCreateChannel({
  channelName,
  accountId,
  userId,
}: {
  channelName: string;
  accountId: string;
  userId: string;
}) {
  return await prisma.channels.create({
    data: {
      channelName,
      externalChannelId: v4(),
      account: {
        connect: { id: accountId },
      },
      memberships: {
        create: { user: { connect: { id: userId } } },
      },
    },
  });
}

export async function OnboardingCreateCommunity({
  authId,
  name,
}: {
  authId: string;
  name: string;
}) {
  const account = await prisma.accounts.create({
    data: {
      name,
      auths: {
        connect: { id: authId },
      },
      channels: {
        create: {
          channelName: 'default',
          externalChannelId: v4(),
          default: true,
        },
      },
      users: {
        create: {
          auth: { connect: { id: authId } },
          isAdmin: true,
          isBot: false,
          role: Roles.OWNER,
        },
      },
    },
  });
  createAccountEvent(authId, account.id);
  return account;
}

export class PathDomainError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'PathDomainError';
  }
}

export async function OnboardingUpdateAccount({
  slackDomain,
  communityType,
  redirectDomain,
  premium,
  accountId,
}: {
  slackDomain: string;
  communityType: AccountType;
  redirectDomain: string;
  premium: boolean;
  accountId: string;
}) {
  try {
    return await prisma.accounts.update({
      data: {
        premium,
        type: communityType,
        slackDomain,
        ...(!!premium && !!redirectDomain && { redirectDomain }),
      },
      where: {
        id: accountId,
      },
    });
  } catch (error: any) {
    if (
      error.code === 'P2002' &&
      error.meta.target.length &&
      error.meta.target[0] === 'slackDomain'
    ) {
      throw new PathDomainError(
        'Path domain must be unique, please try again with another path domain'
      );
    }
    throw error;
  }
}

export async function OnboardingInviteTeam({
  accountId,
  createdByUserId,
  host,
  email1,
  email2,
  email3,
}: {
  accountId: string;
  createdByUserId: string;
  host: string;
  email1?: string;
  email2?: string;
  email3?: string;
}) {
  for (const email of [email1, email2, email3].filter(Boolean)) {
    await createInvitation({
      createdByUserId,
      email: email!,
      accountId,
      host,
      role: Roles.ADMIN,
    });
  }
}
