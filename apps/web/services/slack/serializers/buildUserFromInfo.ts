import { Prisma } from '@linen/database';
import { UserInfo } from '@linen/types';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';

export function buildUserFromInfo(
  user: UserInfo,
  accountId: string
): Prisma.usersUncheckedCreateInput {
  const profile = user.profile;
  const name =
    profile.display_name ||
    profile.display_name_normalized ||
    profile.real_name ||
    profile.real_name_normalized;
  const profileImageUrl = profile.image_original;
  const param = {
    displayName: name,
    externalUserId: user.id,
    profileImageUrl,
    accountsId: accountId,
    isBot: user.is_bot,
    isAdmin: user.is_admin || false,
    anonymousAlias: generateRandomWordSlug(),
  };
  return param;
}
