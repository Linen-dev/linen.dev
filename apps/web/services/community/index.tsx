import { accounts, prisma } from '@linen/database';
import { findAccountByPath } from 'services/accounts';

class CommunityService {
  static async find(params: any): Promise<accounts | null> {
    if (
      params &&
      params.communityId &&
      typeof params.communityId === 'string'
    ) {
      return prisma.accounts.findFirst({
        where: { id: params.communityId },
      });
    }
    if (
      params &&
      params.communityName &&
      typeof params.communityName === 'string'
    ) {
      return findAccountByPath(params.communityName);
    }
    return null;
  }

  static async findByAuthId(authId: string): Promise<accounts[]> {
    return prisma.auths
      .findMany({
        where: {
          id: authId,
        },
        select: { users: { select: { account: true } } },
      })
      .then((rows) =>
        rows.map((row) => row.users.map((user) => user.account)).flat()
      );
  }
}

export default CommunityService;
