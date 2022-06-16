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
