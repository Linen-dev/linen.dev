import { accounts } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';
import { findAccountByPath } from 'lib/models';

class CommunityService {
  static async find(
    context: GetServerSidePropsContext
  ): Promise<accounts | null> {
    if (
      !context.params ||
      !context.params.communityName ||
      typeof context.params.communityName !== 'string'
    ) {
      return null;
    }
    return findAccountByPath(context.params.communityName);
  }
}

export default CommunityService;
