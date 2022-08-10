import prisma from '../client';
import { stripProtocol } from '../utilities/url';
import { generateRandomWordSlug } from 'utilities/randomWordSlugs';

interface FindAccountParams {
  redirectDomain: string;
  logoUrl?: string;
}

interface CreateAccountParams {
  homeUrl: string;
  docsUrl: string;
  redirectDomain: string;
  brandColor: string;
  logoUrl?: string;
  discordDomain?: string;
  slackDomain?: string;
}

export function findAccount({ redirectDomain, logoUrl }: FindAccountParams) {
  return prisma.accounts.findFirst({
    where: { redirectDomain: stripProtocol(redirectDomain), logoUrl },
  });
}

export function findAccountIdByExternalId(externalId: string) {
  return prisma.accounts.findFirst({
    select: { id: true },
    where: { slackTeamId: externalId },
  });
}

export function createAccount({
  homeUrl,
  docsUrl,
  redirectDomain,
  brandColor,
  logoUrl,
  discordDomain,
  slackDomain,
}: CreateAccountParams) {
  return prisma.accounts.create({
    data: {
      homeUrl,
      docsUrl,
      redirectDomain: stripProtocol(redirectDomain),
      brandColor,
      logoUrl,
      discordDomain,
      slackDomain,
    },
  });
}

export async function findSlackAccounts(accountId?: string) {
  return await prisma.accounts.findMany({
    select: { id: true },
    where: {
      slackTeamId: { not: null },
      ...(accountId && {
        AND: {
          OR: [{ id: accountId }, { redirectDomain: accountId }],
        },
      }),
    },
  });
}

export async function createAccountAndUser(email: string, displayName: string) {
  return await prisma.accounts.create({
    data: {
      auths: {
        connect: {
          email,
        },
      },
      users: {
        create: {
          isAdmin: true,
          isBot: false,
          anonymousAlias: generateRandomWordSlug(),
          auth: {
            connect: {
              email,
            },
          },
          displayName,
          externalUserId: null,
          profileImageUrl: null,
        },
      },
    },
  });
}

export async function findAccountsPremiumWithMessages() {
  return await prisma.accounts.findMany({
    select: {
      redirectDomain: true,
    },
    where: {
      premium: true,
      redirectDomain: { not: null },
      channels: { some: { messages: { some: { id: {} } } } },
    },
  });
}

export async function findAccountsFreeDiscordWithMessages() {
  return await prisma.accounts.findMany({
    select: {
      discordDomain: true,
      discordServerId: true,
    },
    where: {
      premium: false,
      discordAuthorizations: { some: {} },
      channels: { some: { messages: { some: { id: {} } } } },
      AND: {
        OR: [
          { discordDomain: { not: null } },
          { discordServerId: { not: null } },
        ],
      },
    },
  });
}

export async function findAccountsFreeSlackWithMessages() {
  return await prisma.accounts.findMany({
    select: {
      slackDomain: true,
      slackTeamId: true,
    },
    where: {
      premium: false,
      slackAuthorizations: { some: {} },
      channels: { some: { messages: { some: { id: {} } } } },
      AND: {
        OR: [{ slackDomain: { not: null } }, { slackTeamId: { not: null } }],
      },
    },
  });
}
