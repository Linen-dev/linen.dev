import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { withSentry } from '@sentry/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let skip = 0;
  let threadsToUpdate = await prisma.threads.findMany({
    include: {
      messages: {
        orderBy: {
          sentAt: 'asc',
        },
      },
    },
    skip,
    take: 100,
  });

  while (threadsToUpdate.length > 0) {
    console.log('looping');
    skip += 100;
    const threadsTransaction = threadsToUpdate.map((t) => {
      return prisma.threads.update({
        where: {
          id: t.id,
        },
        data: {
          messageCount: t.messages.length,
        },
      });
    });
    await prisma.$transaction(threadsTransaction);
    threadsToUpdate = await prisma.threads.findMany({
      include: {
        messages: {
          orderBy: {
            sentAt: 'asc',
          },
        },
      },
      skip,
      take: 100,
    });
  }

  res.status(200).json(threadsToUpdate[0]);
}

export default withSentry(handler);
