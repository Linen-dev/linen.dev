import { accounts } from '@prisma/client';
import { findAccountByPath } from 'lib/models';
import prisma from 'client';

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
