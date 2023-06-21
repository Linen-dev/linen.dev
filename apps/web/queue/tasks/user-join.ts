// import { TaskInterface } from 'queue';
import { ChannelType, prisma } from '@linen/database';

export const userJoinTask = async (payload: { userId: string }) => {
  const user = await prisma.users.findUnique({
    where: { id: payload.userId },
    include: { auth: true, account: true },
  });

  if (user && user.auth && user.account) {
    const channels = await prisma.channels.findMany({
      select: { id: true },
      where: {
        accountId: user.account.id,
        hidden: false,
        default: true,
        type: ChannelType.PUBLIC,
      },
    });

    if (channels.length) {
      await prisma.memberships.createMany({
        data: channels.map((c) => {
          return {
            usersId: user.id,
            channelsId: c.id,
          };
        }),
        skipDuplicates: true,
      });
    }
  }
};
