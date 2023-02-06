import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';
import { prisma } from '@linen/database';
import { z } from 'zod';
import { ReminderTypes } from '@linen/types';
import { soon, tomorrow, nextWeek } from '@linen/utilities/date';
import { createRemindMeJob } from 'queue/jobs';

const createSchema = z.object({
  threadIds: z.array(z.string()),
  muted: z.boolean(),
  read: z.boolean(),
  reminder: z.boolean(),
  reminderType: z
    .enum([ReminderTypes.SOON, ReminderTypes.TOMORROW, ReminderTypes.NEXT_WEEK])
    .optional(),
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
}) {
  const body = createSchema.safeParse(params);
  if (!body.success) {
    return { status: 400, data: { error: body.error } };
  }

  const { threadIds, userId, muted, read, reminder, reminderType } = params;

  const creation = muted || read || reminder;

  if (creation) {
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
  } else {
    await prisma.userThreadStatus.deleteMany({
      where: {
        userId,
        threadId: { in: threadIds },
      },
    });
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
