import prisma from '../client';
import { v4 } from 'uuid';
import { Roles } from '@prisma/client';
import { createInvitation } from './invites';

export async function OnboardingCreateChannel(sessionEmail: string, body: any) {
  const { channelName, accountId } = JSON.parse(body);

  if (!accountId) {
    throw 'missing account id';
  }

  const auth = await prisma.auths.findFirst({
    where: {
      email: sessionEmail,
      users: { some: { accountsId: accountId } },
    },
    include: { account: true, users: true },
  });

  if (auth?.account?.id !== accountId) {
    throw 'unauthorized';
  }

  const user = auth?.users.find((u) => u.accountsId === accountId);

  return await prisma.channels.create({
    data: {
      channelName,
      externalChannelId: v4(),
      account: {
        connect: { id: accountId },
      },
      memberships: {
        create: { user: { connect: { id: user?.id } } },
      },
    },
  });
}

export async function OnboardingCreateCommunity(
  sessionEmail: string,
  body: any
) {
  const { name } = JSON.parse(body);
  return await prisma.accounts.create({
    data: {
      name,
      auths: {
        connect: { email: sessionEmail },
      },
      // channels: {
      //   create: {
      //     channelName: 'general',
      //     externalChannelId: v4(),
      //     default: true,
      //   },
      // },
      users: {
        create: {
          auth: { connect: { email: sessionEmail } },
          isAdmin: true,
          isBot: false,
          role: Roles.OWNER,
        },
      },
    },
  });
}

export class PathDomainError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'PathDomainError';
  }
}

export async function OnboardingUpdateAccount(sessionEmail: string, body: any) {
  const { slackDomain, communityType, redirectDomain, premium, accountId } =
    JSON.parse(body);

  if (!accountId) throw 'missing account id';

  const auth = await prisma.auths.findFirst({
    where: { email: sessionEmail },
    include: { account: true },
  });

  if (auth?.account?.id !== accountId) {
    throw 'unauthorized';
  }

  try {
    return await prisma.accounts.update({
      data: {
        premium,
        type: communityType,
        slackDomain,
        ...(!!redirectDomain && { redirectDomain }),
      },
      where: {
        id: accountId,
      },
    });
  } catch (error: any) {
    // console.dir(Object.entries(error), { depth: Infinity });
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

export async function OnboardingInviteTeam(
  sessionEmail: string,
  body: any,
  host: string
) {
  const { channelId, email1, email2, email3 } = JSON.parse(body);

  if (!email1 && !email2 && !email3) return;

  if (!channelId) {
    throw 'missing channel id';
  }

  const channel = await prisma.channels.findFirst({
    where: { id: channelId },
    include: { account: true },
  });

  if (!channel || !channel.account) throw 'channel not found';

  const auth = await prisma.auths.findFirst({
    where: {
      email: sessionEmail,
    },
    include: { account: true },
  });

  if (!auth || !auth.account) throw 'auth not found';

  if (auth.account.id !== channel.account.id) {
    throw 'unauthorized';
  }

  for (const email of [email1, email2, email3].filter(Boolean)) {
    await createInvitation({
      requesterEmail: sessionEmail,
      email,
      accountId: channel.account.id,
      host,
      role: Roles.ADMIN,
    });
  }
}
