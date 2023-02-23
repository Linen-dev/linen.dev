import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import { prisma } from '@linen/database';
import { z } from 'zod';
import { ReminderTypes } from '@linen/types';
import { soon, tomorrow, nextWeek } from '@linen/utilities/date';
import { createRemindMeJob } from 'queue/jobs';
import UserThreadStatusService from 'services/user-thread-status';

const createSchema = z.object({
  threadIds: z.array(z.string()),
  muted: z.boolean(),
  read: z.boolean(),
  reminder: z.boolean(),
  reminderType: z
    .enum([ReminderTypes.SOON, ReminderTypes.TOMORROW, ReminderTypes.NEXT_WEEK])
    .optional(),
  limit: z.number(),
});

function getRemindAt(reminder: ReminderTypes) {
  switch (reminder) {
    case ReminderTypes.SOON:
      return soon();
    case ReminderTypes.TOMORROW:
      return tomorrow();
    case ReminderTypes.NEXT_WEEK:
      return nextWeek();
  }
}

export async function create(params: {
  threadIds: string[];
  userId: string;
  muted: boolean;
  read: boolean;
  reminder: boolean;
  reminderType?: ReminderTypes;
  limit: number;
}) {
  const body = createSchema.safeParse(params);
  if (!body.success) {
    return { status: 400, data: { error: body.error } };
  }

  const { threadIds, userId, muted, read, reminder, reminderType, limit } =
    params;

  const creation = muted || read || reminder;

  if (creation && threadIds.length > 0) {
    await prisma.$transaction([
      prisma.userThreadStatus.deleteMany({
        where: {
          userId,
          threadId: { in: threadIds },
        },
      }),
      prisma.userThreadStatus.createMany({
        data: threadIds.map((threadId) => {
          if (reminderType) {
            const remindAt = getRemindAt(reminderType);
            createRemindMeJob(`${threadId}_${userId}`, remindAt, {
              threadId,
              userId,
            });
            return {
              userId,
              threadId,
              muted,
              read,
              reminder,
              remindAt,
            };
          }
          return {
            userId,
            threadId,
            muted,
            read,
            reminder,
          };
        }),
      }),
    ]);
  } else if (threadIds.length > 0) {
    await prisma.userThreadStatus.deleteMany({
      where: {
        userId,
        threadId: { in: threadIds },
      },
    });
  } else if (threadIds.length === 0 && read) {
    try {
      const count = await prisma.threads.count({
        where: {
          hidden: false,
          userThreadStatus: {
            none: {
              userId,
              OR: [{ read: true }, { muted: true }, { reminder: true }],
            },
          },
        },
      });

      if (count < limit) {
        await UserThreadStatusService.markAllAsRead({ userId });
        return { status: 200, data: { count: 0 } };
      }

      const threads = await prisma.threads.findMany({
        select: { id: true },
        where: {
          hidden: false,
          userThreadStatus: {
            none: {
              userId,
              OR: [{ read: true }, { muted: true }, { reminder: true }],
            },
          },
        },
        take: limit,
      });
      const threadIds = threads.map(({ id }) => id);

      await prisma.userThreadStatus.createMany({
        data: threadIds.map((threadId) => {
          return { threadId, userId, read: true, muted: false };
        }),
      });

      return { status: 200, data: { count: count - limit } };
    } catch (exception) {
      console.log(exception);
      return { status: 500 };
    }
  }

  return { status: 200 };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const permissions = await PermissionsService.get({
      request,
      response,
      params: {
        communityId: request.body.communityId,
      },
    });
    if (!permissions.access) {
      return response.status(401).json({});
    }

    if (!permissions.user) {
      return response.status(401).json({});
    }

    const { status, data } = await create({
      ...request.body,
      userId: permissions.user.id,
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}
