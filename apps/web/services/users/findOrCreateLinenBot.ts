import { prisma } from '@linen/database';
import { config } from 'config';

export async function findOrCreateLinenBot(accountId: string) {
  let linenBot = await prisma.users.findUnique({
    where: {
      externalUserId_accountsId: {
        accountsId: accountId,
        externalUserId: config.linen.bot.externalId,
      },
    },
  });
  if (!linenBot) {
    linenBot = await prisma.users.create({
      data: {
        isAdmin: false,
        isBot: true,
        accountsId: accountId,
        externalUserId: config.linen.bot.externalId,
        displayName: config.linen.bot.displayName,
        profileImageUrl: config.linen.squareLogo,
      },
    });
  }
  return linenBot;
}
