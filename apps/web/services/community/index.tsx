import { accounts, prisma } from '@linen/database';
import { findAccountByPath } from 'lib/models';

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
}

export default CommunityService;
