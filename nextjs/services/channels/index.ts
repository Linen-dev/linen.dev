import prisma from 'client';
import { channels } from '@prisma/client';

class ChannelsService {
  static async find(communityId: string): Promise<channels[]> {
    return prisma.channels.findMany({
      where: {
        hidden: false,
        accountId: communityId,
      },
    });
  }
}

export default ChannelsService;
