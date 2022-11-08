import prisma from '../../client';
import { AccountType, ChatType } from '@prisma/client';

export async function createAccounts() {
  await prisma.accounts.createMany({
    data: [
      {
        name: 'Linen',
        homeUrl: `https://linen.dev`,
        docsUrl: `https://linen.dev/docs`,
        redirectDomain: 'linen.dev',
        brandColor: '#000000',
        slackDomain: 'linen',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-white-logo.svg',
        chat: ChatType.MEMBERS,
        syncStatus: 'DONE',
      },
      {
        name: 'Foo',
        homeUrl: `https://foo.dev`,
        docsUrl: `https://foo.dev/docs`,
        redirectDomain: 'foo.dev',
        brandColor: '#000000',
        slackDomain: 'foo',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-white-logo.svg',
        chat: ChatType.MEMBERS,
        syncStatus: 'DONE',
      },
      {
        name: 'Private',
        homeUrl: `https://private.dev`,
        docsUrl: `https://private.dev/docs`,
        redirectDomain: 'private.dev',
        brandColor: '#000000',
        slackDomain: 'private',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-white-logo.svg',
        type: AccountType.PRIVATE,
        chat: ChatType.MEMBERS,
        syncStatus: 'DONE',
      },
      {
        name: 'Empty',
        homeUrl: `https://empty.dev`,
        docsUrl: `https://empty.dev/docs`,
        redirectDomain: 'empty.dev',
        brandColor: '#000000',
        slackDomain: 'empty',
        logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-white-logo.svg',
        chat: ChatType.MEMBERS,
        syncStatus: 'DONE',
      },
    ],
  });
  return prisma.accounts.findMany();
}
