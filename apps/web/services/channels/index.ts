import prisma from 'client';
import { channels } from '@prisma/client';

class ChannelsService {
  static async find(communityId: string): Promise<channels[]> {
    return prisma.channels.findMany({
      where: {
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

  static async updateCursor(channelId: string, cursor?: string | null) {
    if (cursor) {
      await prisma.channels.update({
        data: { externalPageCursor: cursor },
        where: { id: channelId },
      });
    }
  }

  static async findOrCreateChannel({
    accountId,
    channelName,
    externalChannelId,
    hidden,
  }: {
    accountId: string;
    channelName: string;
    externalChannelId: string;
    hidden?: boolean;
  }) {
    const channel = await prisma.channels.findFirst({
      where: {
        accountId,
        OR: [{ externalChannelId }, { channelName }],
      },
    });

    if (channel) {
      if (channel.externalChannelId !== externalChannelId) {
        return await prisma.channels.update({
          where: { id: channel.id },
          data: {
            externalChannelId,
            hidden,
          },
        });
      }
      return channel;
    }

    return await prisma.channels.create({
      data: {
        accountId,
        channelName,
        externalChannelId,
        hidden,
      },
    });
  }

  static async findByExternalId(externalChannelId: string) {
    return await prisma.channels.findUnique({
      where: { externalChannelId },
    });
  }
}

export default ChannelsService;
