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

  static async setDefaultChannel(
    newDefaultChannelId: string,
    oldDefaultChannelId: string
  ) {
    const transactions = [
      prisma.channels.update({
        where: {
          id: newDefaultChannelId,
        },
        data: {
          default: true,
          hidden: false,
        },
      }),
    ];
    if (oldDefaultChannelId) {
      transactions.push(
        prisma.channels.update({
          where: {
            id: oldDefaultChannelId,
          },
          data: {
            default: false,
          },
        })
      );
    }
    await prisma.$transaction(transactions);
    return { status: 200 };
  }

  static async updateChannelsVisibility(
    channels: Partial<channels>[],
    accountId: string
  ) {
    const { channelsIdToHide, channelsIdToShow } = channels.reduce(
      (prev, curr) => {
        if (curr.hidden === true) {
          prev.channelsIdToHide.push(curr.id!);
        }
        if (curr.hidden === false) {
          prev.channelsIdToShow.push(curr.id!);
        }
        return prev;
      },
      {
        channelsIdToHide: [],
        channelsIdToShow: [],
      } as {
        channelsIdToHide: string[];
        channelsIdToShow: string[];
      }
    );

    return await prisma.$transaction([
      prisma.channels.updateMany({
        where: {
          id: { in: channelsIdToHide },
          accountId,
          default: false,
        },
        data: {
          hidden: true,
        },
      }),
      prisma.channels.updateMany({
        where: {
          id: { in: channelsIdToShow },
          accountId,
        },
        data: {
          hidden: false,
        },
      }),
    ]);
  }
}

export default ChannelsService;
