import prisma from '../client';
import { stripProtocol } from '../utilities/url';

interface FindAccountParams {
  redirectDomain: string;
}

interface CreateAccountParams {
  homeUrl: string;
  docsUrl: string;
  redirectDomain: string;
  brandColor: string;
}

export function findAccount({ redirectDomain }: FindAccountParams) {
  return prisma.accounts.findFirst({
    where: { redirectDomain: stripProtocol(redirectDomain) },
  });
}

export function createAccount({
  homeUrl,
  docsUrl,
  redirectDomain,
  brandColor,
}: CreateAccountParams) {
  return prisma.accounts.create({
    data: {
      homeUrl,
      docsUrl,
      redirectDomain: stripProtocol(redirectDomain),
      brandColor,
    },
  });
}
