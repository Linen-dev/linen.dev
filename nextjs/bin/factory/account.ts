import prisma from '../../client';
import { AccountType } from '@prisma/client';

export async function createAccounts() {
  await prisma.accounts.createMany({
    data: [
      {
        homeUrl: `https://linen.dev`,
        docsUrl: `https://linen.dev/docs`,
        redirectDomain: 'linen.dev',
        brandColor: '#00bcd4',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
      },
      {
        homeUrl: `https://empty.dev`,
        docsUrl: `https://empty.dev/docs`,
        redirectDomain: 'empty.dev',
        brandColor: '#00bcd4',
        slackDomain: 'empty',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
      },
      {
        homeUrl: `https://private.dev`,
        docsUrl: `https://private.dev/docs`,
        redirectDomain: 'private.dev',
        brandColor: '#00bcd4',
        slackDomain: 'private',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
        type: AccountType.PRIVATE,
      },
    ],
  });
  return prisma.accounts.findMany();
}
