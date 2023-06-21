import {
  channels,
  channelsIntegrationType,
  ChannelType,
  prisma,
} from '@linen/database';
import {
  findChannelsWithStats,
  channelPutIntegrationType,
  ChannelViewType,
} from '@linen/types';
import { formatDistance } from '@linen/utilities/date';
import { serializeChannel, serializeDm } from '@linen/serializers/channel';
import { v4 } from 'uuid';

class ChannelsService {
  static async find(communityId: string): Promise<channels[]> {
    return prisma.channels.findMany({
      where: {
        accountId: communityId,
        type: ChannelType.PUBLIC,
        hidden: false,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  static async findPrivates({
    accountId,
    userId,
  }: {
    accountId: string;
    userId: string;
  }): Promise<channels[]> {
    return prisma.channels.findMany({
      where: {
        accountId,
        type: ChannelType.PRIVATE,
        hidden: false,
        memberships: { some: { usersId: userId } },
      },
    });
  }

  static async findJoined({
    accountId,
    userId,
  }: {
    accountId: string;
    userId: string;
  }): Promise<channels[]> {
    return prisma.channels.findMany({
      where: {
        accountId,
        type: ChannelType.PUBLIC,
        hidden: false,
        memberships: { some: { usersId: userId } },
      },
    });
  }

  static async findWithStats(
    communityId: string
  ): Promise<findChannelsWithStats> {
    return await prisma.channels
      .findMany({
        include: {
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
        orderBy: {
          displayOrder: 'asc',
        },
      })
      .then((channels) =>
        channels.map(({ threads, _count, ...rest }) => {
          const lastThreadAt = threads.find(Boolean)?.sentAt;
          const threadCount = _count.threads;

          let stats = `${threadCount} thread${threadCount > 1 ? 's' : ''}`;

          if (lastThreadAt) {
            const date = new Date(
              Math.floor(Number(lastThreadAt))
            ).toISOString();
            stats += `, latest from ${formatDistance(date)}`;
          }
          return { ...serializeChannel(rest), stats };
        })
      );
  }

  static async setDefaultChannels({
    channelIds,
    accountId,
  }: {
    channelIds: string[];
    accountId: string;
  }) {
    const channels = await prisma.channels.findMany({
      where: {
        accountId,
      },
      select: {
        id: true,
        default: true,
      },
    });
    const transactions = [
      prisma.channels.updateMany({
        where: {
          id: { in: channelIds },
          accountId,
        },
        data: {
          default: true,
          hidden: false,
        },
      }),
      prisma.channels.updateMany({
        where: {
          id: {
            in: channels
              .map(({ id }) => id)
              .filter((id) => !channelIds.includes(id)),
          },
          accountId,
        },
        data: {
          default: false,
        },
      }),
    ];
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

  static async reorder({
    channels,
    accountId,
  }: {
    channels: Partial<channels>[];
    accountId: string;
  }) {
    return await prisma.$transaction(
      channels.map(({ id, displayOrder }) =>
        prisma.channels.updateMany({
          where: {
            id,
            accountId,
          },
          data: {
            displayOrder,
          },
        })
      )
    );
  }

  static async joinChannel({
    channelId,
    userId,
  }: {
    channelId: string;
    userId: string;
  }) {
    await prisma.memberships.create({
      data: {
        usersId: userId,
        channelsId: channelId,
      },
    });
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
    viewType,
    members,
  }: {
    accountId: string;
    channelName: string;
    externalChannelId: string;
    hidden?: boolean;
    viewType?: ChannelViewType;
    members?: string[];
  }) {
    const channel = await prisma.channels.findFirst({
      where: {
        accountId,
        OR: [{ externalChannelId }, { channelName }],
      },
    });

    if (channel) {
      if (
        externalChannelId &&
        channel.externalChannelId !== externalChannelId
      ) {
        return await prisma.channels.update({
          where: { id: channel.id },
          data: {
            externalChannelId,
            viewType,
          },
        });
      }

      if (channelName && channelName.toLowerCase() !== channel.channelName) {
        return await prisma.channels.update({
          where: { id: channel.id },
          data: {
            channelName: channelName.toLowerCase(),
            viewType,
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
        viewType,
        ...(members?.length
          ? {
              memberships: {
                createMany: {
                  skipDuplicates: true,
                  data: members.map((m) => {
                    return { usersId: m };
                  }),
                },
              },
            }
          : {}),
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

  static async unarchiveChannel({ channelId }: { channelId: string }) {
    await prisma.memberships.updateMany({
      data: { archived: false },
      where: { channelsId: channelId },
    });
  }

  static async createPrivateChannel({
    channelName,
    externalChannelId,
    accountId,
    usersId = [],
    ownerId,
    viewType,
  }: {
    externalChannelId: string;
    channelName: string;
    accountId: string;
    ownerId: string;
    usersId: string[] | undefined;
    viewType?: ChannelViewType;
  }) {
    const members = [ownerId, ...usersId].map((u) => ({
      usersId: u,
    }));

    return await prisma.channels.create({
      data: {
        channelName,
        accountId,
        createdByUserId: ownerId,
        externalChannelId,
        type: ChannelType.PRIVATE,
        memberships: {
          createMany: {
            skipDuplicates: true,
            data: members,
          },
        },
        viewType,
      },
    });
  }

  static async getChannelAndMembersWithAuth(channelId: string) {
    return await prisma.channels.findUnique({
      select: {
        id: true,
        memberships: {
          select: {
            archived: true,
            user: {
              select: {
                id: true,
                authsId: true,
              },
            },
          },
        },
        type: true,
      },
      where: { id: channelId },
    });
  }
}

export default ChannelsService;

export async function getDMs({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}) {
  return await prisma.channels
    .findMany({
      include: {
        memberships: {
          select: {
            user: true,
            archived: true,
          },
        },
      },
      where: {
        accountId,
        type: ChannelType.DM,
        memberships: { some: { usersId: userId } },
      },
      orderBy: { createdAt: 'desc' },
    })
    .then((e) => e.map(serializeDm(userId)));
}

export async function shouldThisChannelBeAnonymous(channelId: string) {
  return await prisma.accounts
    .findFirst({
      where: {
        channels: {
          some: { id: channelId },
        },
      },
      select: { anonymizeUsers: true },
    })
    .then((account) => account?.anonymizeUsers);
}

export async function hideEmptyChannels(accountId: string) {
  const channels = await prisma.channels.findMany({
    include: { _count: true },
    where: { accountId, channelName: { not: 'default' } },
  });
  const promise = channels
    .map(async (channel) => {
      if (!channel._count.threads && !channel._count.messages) {
        await prisma.channels.update({
          where: { id: channel.id },
          data: { hidden: true },
        });
      }
    })
    .filter(Boolean);
  return Promise.all(promise);
}

export async function createChannel({
  name,
  accountId,
  externalChannelId,
  hidden,
  viewType,
}: {
  name: string;
  accountId: string;
  externalChannelId: string;
  hidden?: boolean;
  viewType?: ChannelViewType;
}) {
  const exists = await prisma.channels.findUnique({
    where: {
      externalChannelId,
    },
  });
  if (exists) {
    return exists;
  }
  return await prisma.channels.create({
    data: {
      channelName: name.toLowerCase(),
      accountId,
      externalChannelId,
      hidden,
      viewType,
    },
  });
}

export function findChannelByExternalId({
  externalId,
  accountId,
}: {
  externalId: string;
  accountId: string;
}) {
  return prisma.channels.findFirst({
    where: { externalChannelId: externalId, accountId },
  });
}

export function renameChannel({ name, id }: { name: string; id: string }) {
  return prisma.channels.update({
    where: {
      id,
    },
    data: {
      channelName: name.toLowerCase(),
    },
  });
}

export async function findChannelWithAccountByExternalId(
  externalId: string,
  externalAccountId: string
) {
  return await prisma.channels.findUnique({
    where: {
      externalChannelId: externalId,
    },
    include: {
      account: {
        include: {
          slackAuthorizations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });
}

export const updateNextPageCursor = async (
  channelId: string,
  externalPageCursor: string
) => {
  return await prisma.channels.update({
    where: {
      id: channelId,
    },
    data: {
      externalPageCursor,
    },
  });
};
