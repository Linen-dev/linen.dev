import { Prisma } from '@linen/database';
import { BotInfo } from '@linen/types';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';

export function buildUserBotFromInfo(
  bot: BotInfo,
  accountId: string
): Prisma.usersUncheckedCreateInput {
  const param = {
    displayName: bot?.name,
    externalUserId: bot?.id,
    profileImageUrl:
      bot?.icons?.image_72 || bot?.icons?.image_48 || bot?.icons?.image_36,
    accountsId: accountId,
    isBot: true,
    isAdmin: false,
    anonymousAlias: generateRandomWordSlug(),
  };
  return param;
}
