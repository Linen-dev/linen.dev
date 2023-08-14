import { prisma } from '@linen/database';
import { normalize } from '@linen/utilities/string';
import { AccountType, Roles } from '@linen/types';
import { generateRandomWordSlug } from '@linen/utilities/randomWordSlugs';
import { eventUserJoin } from 'services/events/eventUserJoin';

export default class OnboardingService {
  static async joinCommunity({
    accountId,
    authId,
    displayName,
    email,
  }: {
    accountId: string;
    authId: string;
    displayName?: string;
    email: string;
  }) {
    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
    });
    if (account && account.type === AccountType.PUBLIC) {
      const user = await prisma.users.create({
        data: {
          isAdmin: false,
          isBot: false,
          accountsId: accountId,
          displayName: normalize(
            displayName || email.split('@').shift() || email
          ),
          anonymousAlias: generateRandomWordSlug(),
          role: Roles.MEMBER,
          authsId: authId,
        },
      });
      await eventUserJoin({ userId: user.id });
      return { account, user: user };
    }
    return { account };
  }
}
