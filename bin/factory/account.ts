import prisma from '../../client';

export async function createAccounts() {
  await prisma.accounts.create({
    data: {
      homeUrl: `https://pulumi.dev`,
      docsUrl: `https://pulumi.dev/docs`,
      redirectDomain: 'pulumi.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/pulumi-logo.svg',
    },
  });
  await prisma.accounts.create({
    data: {
      homeUrl: `https://prefect.dev`,
      docsUrl: `https://prefect.dev/docs`,
      redirectDomain: 'prefect.dev',
      brandColor: '#00bcd4',
      logoUrl: 'https://linen-assets.s3.amazonaws.com/prefect-logo.svg',
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
  return [account, account2];
}
