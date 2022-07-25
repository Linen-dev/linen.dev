import prisma from '../client';
import { stripProtocol } from '../utilities/url';

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
