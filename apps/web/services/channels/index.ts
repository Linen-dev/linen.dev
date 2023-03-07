import {
  channels,
  channelsIntegrationType,
  ChannelType,
  prisma,
} from '@linen/database';
import { channelPutIntegrationType } from '@linen/types';
import { formatDistance } from '@linen/utilities/date';
import serializeChannel from 'serializers/channel';
import { v4 } from 'uuid';

class ChannelsService {
  static async find(communityId: string): Promise<channels[]> {
    return prisma.channels.findMany({
      where: {
        accountId: communityId,
        type: ChannelType.PUBLIC,
        hidden: false,
      },
    });
  }

  static async findWithStats(communityId: string) {
    return await prisma.channels
      .findMany({
        select: {
          id: true,
          _count: { select: { threads: true } },
          threads: {
            take: 1,
            orderBy: { sentAt: 'desc' },
            select: { sentAt: true },
          },
        },
        where: {
          accountId: communityId,
          type: { not: ChannelType.DM },
        },
      })
      .then((channels) =>
        channels.map(({ threads, _count, id }) => {
          const lastThreadAt = threads.find(Boolean)?.sentAt;
          const threadCount = _count.threads;

          let stats = `${threadCount} thread${threadCount > 1 ? 's' : ''}`;

          if (lastThreadAt) {
            const date = new Date(
              Math.floor(Number(lastThreadAt))
            ).toISOString();
            stats += `, latest from ${formatDistance(date)}`;
          }
          return { stats, id };
        })
      );
  }

  static async setDefaultChannel({
    newDefaultChannelId,
    oldDefaultChannelId,
    accountId,
  }: {
    newDefaultChannelId: string;
    oldDefaultChannelId?: string;
    accountId: string;
  }) {
    const transactions = [
      prisma.channels.updateMany({
        where: {
          id: newDefaultChannelId,
          accountId,
        },
        data: {
          default: true,
          hidden: false,
        },
      }),
    ];
    if (oldDefaultChannelId) {
      transactions.push(
        prisma.channels.updateMany({
          where: {
            id: oldDefaultChannelId,
            accountId,
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

  static async updateChannelsVisibility({
    channels,
    accountId,
  }: {
    channels: Partial<channels>[];
    accountId: string;
  }) {
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
          },
        });
      }
      return channel;
    }

    return await prisma.channels.create({
      data: {
        accountId,
        channelName: channelName.toLowerCase(),
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

  static async findById(id: string) {
    return await prisma.channels.findUnique({
      where: { id },
    });
  }

  static async findByExternalIntegrationId(externalId: string) {
    return await prisma.channelsIntegration
      .findFirst({
        select: { channel: true },
        where: {
          externalId,
        },
      })
      .then((r) => r?.channel);
  }

  static async getChannelIntegration({
    channelId,
    type,
  }: {
    channelId: string;
    type: channelsIntegrationType;
  }) {
    return await prisma.channelsIntegration.findFirst({
      select: { data: true, externalId: true },
      where: {
        type,
        channelId,
      },
    });
  }

  static async putChannelIntegration({
    integrationId,
    data,
    externalId,
  }: channelPutIntegrationType) {
    const integration = await prisma.channelsIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return null;
    }

    return await prisma.channelsIntegration.update({
      select: { data: true },
      where: { id: integrationId },
      data: {
        externalId,
        data: {
          ...(integration.data as any), // current data
          ...data, // new data
        },
      },
    });
  }

  static async findOrCreateDM({
    accountId,
    userId,
    dmWithUserId,
  }: {
    accountId: string;
    userId: string;
    dmWithUserId: string;
  }) {
    const dms = await prisma.channels.findMany({
      include: { memberships: true },
      where: {
        accountId,
        type: ChannelType.DM,
        memberships: { some: { usersId: userId } },
      },
    });

    const exist = dms.find((dm) =>
      dm.memberships.find((m) => m.usersId === dmWithUserId)
    );

    if (exist) {
      // remove archived toggle
      await prisma.memberships.update({
        data: { archived: false },
        where: {
          usersId_channelsId: { channelsId: exist.id, usersId: userId },
        },
      });
      return serializeChannel(exist);
    }

    const uuid = v4();
    const dm = await prisma.channels.create({
      data: {
        id: uuid,
        channelName: uuid,
        accountId,
        createdByUserId: userId,
        type: ChannelType.DM,
        memberships: {
          createMany: {
            data: [
              { usersId: userId },
              // by default we set as archived for the other user
              // when a new message arrive we toggle to archived false
              { usersId: dmWithUserId, archived: true },
            ],
          },
        },
      },
    });

    return serializeChannel(dm);
  }

  static async archiveChannel({
    channelId,
    userId,
  }: {
    channelId: string;
    userId: string;
  }) {
    await prisma.memberships.update({
      data: { archived: true },
      where: { usersId_channelsId: { channelsId: channelId, usersId: userId } },
    });
  }

  static async unarchiveDM({ channelId }: { channelId: string }) {
    const dm = await prisma.channels.findFirst({
      where: { id: channelId, type: ChannelType.DM },
    });
    if (dm) {
      await this.unarchiveChannel({ channelId });
    }
  }

  static async unarchiveChannel({ channelId }: { channelId: string }) {
    await prisma.memberships.updateMany({
      data: { archived: false },
      where: { channelsId: channelId },
    });
  }
}

export default ChannelsService;
