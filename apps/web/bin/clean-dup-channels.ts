import { prisma } from '@linen/database';

(async () => {
  const channels = await prisma.channels
    .groupBy({
      by: ['accountId', 'channelName'],
      _count: true,
    })
    .then((res) => res.filter((c) => c._count > 1));

  for (const channel of channels) {
    console.log('channel', channel);
    const stats = await prisma.channels.findMany({
      where: {
        accountId: channel.accountId,
        channelName: channel.channelName,
      },
      select: {
        id: true,
      },
    });
    const first = stats.shift();
    if (!first) continue;
    console.log('first', first.id);

    const toRemove = stats.map((s) => s.id);
    console.log('toRemove', toRemove);

    await prisma.$transaction(async (tx) => {
      const externalIds = await tx.messages.findMany({
        select: { externalMessageId: true },
        where: {
          channelId: first.id,
          externalMessageId: { not: null },
        },
      });

      await tx.messages.updateMany({
        data: { channelId: first.id },
        where: {
          channelId: { in: toRemove },
          externalMessageId: {
            notIn: externalIds.map((rr) => rr.externalMessageId!),
          },
        },
      });

      await tx.messages.deleteMany({ where: { channelId: { in: toRemove } } });

      await tx.threads.updateMany({
        data: { channelId: first.id },
        where: { channelId: { in: toRemove } },
      });

      const memberships = await tx.memberships.findMany({
        select: { usersId: true },
        where: { channelsId: first.id },
      });
      const membersAlready = memberships.map((m) => m.usersId);

      await tx.memberships.updateMany({
        data: { channelsId: first.id },
        where: {
          channelsId: { in: toRemove },
          usersId: { notIn: membersAlready },
        },
      });

      await tx.memberships.deleteMany({
        where: { channelsId: { in: toRemove } },
      });

      await tx.channels.deleteMany({
        where: { id: { in: toRemove } },
      });
    });
  }
})();
