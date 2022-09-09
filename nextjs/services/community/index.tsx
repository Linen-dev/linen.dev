import { accounts } from '@prisma/client';
import { findAccountByPath } from 'lib/models';

class CommunityService {
  static async find(params: any): Promise<accounts | null> {
    if (
      !params ||
      !params.communityName ||
      typeof params.communityName !== 'string'
    ) {
      return null;
    }
    return findAccountByPath(params.communityName);
  }
}

export default CommunityService;
