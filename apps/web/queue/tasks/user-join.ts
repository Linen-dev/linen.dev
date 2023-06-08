import { JobHelpers } from 'graphile-worker';
import { TaskInterface } from 'queue';
import { ChannelType, prisma } from '@linen/database';

export const userJoinTask: TaskInterface = async (
  payload: { userId: string },
  helpers: JobHelpers
) => {
  helpers.logger.info(JSON.stringify(payload));
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
