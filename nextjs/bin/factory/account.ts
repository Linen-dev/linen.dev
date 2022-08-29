import prisma from '../../client';

export async function createAccounts() {
  await prisma.accounts.create({
    data: {
      homeUrl: `https://communityTwo.dev`,
      docsUrl: `https://communityTwo.dev/docs`,
      redirectDomain: 'communityTwo.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/communityTwo-logo.svg',
    },
  });
  await prisma.accounts.create({
    data: {
      homeUrl: `https://communityOne.dev`,
      docsUrl: `https://communityOne.dev/docs`,
      redirectDomain: 'communityOne.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/communityOne-logo.svg',
    },
  });
  const account = await prisma.accounts.create({
    data: {
      homeUrl: `https://linen.dev`,
      docsUrl: `https://linen.dev/docs`,
      redirectDomain: 'linen.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
    },
  });
  const account2 = await prisma.accounts.create({
    data: {
      homeUrl: `https://empty.dev`,
      docsUrl: `https://empty.dev/docs`,
      redirectDomain: 'empty.dev',
      brandColor: '#00bcd4',
      slackDomain: 'empty',
    },
  });
  const account3 = await prisma.accounts.create({
    data: {
      homeUrl: `https://private.dev`,
      docsUrl: `https://private.dev/docs`,
      redirectDomain: 'private.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/linen-black-logo.svg',
      slackDomain: 'private',
    },
  });
  return [account, account2, account3];
}
