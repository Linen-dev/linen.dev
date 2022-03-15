import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let skip = 0;
  let threadsWIthOneMessage = await prisma.slackThreads.findMany({
    where: {
      messageCount: 1,
      messages: { some: {} },
    },
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

  while (threadsWIthOneMessage.length > 0) {
    console.log('looping');
    skip += 100;
    for (let i = 0; i < threadsWIthOneMessage.length; i++) {
      const thread = threadsWIthOneMessage[i];
      if (thread.messages.length === 0) {
        console.log({ thread });
        continue;
      }
      await prisma.slackThreads.update({
        where: {
          id: thread.id,
        },
        data: {
          messageCount: thread.messages.length,
        },
      });
    }
    threadsWIthOneMessage = await prisma.slackThreads.findMany({
      where: {
        messageCount: 1,
        messages: { some: {} },
      },
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

  console.log(threadsWIthOneMessage[0]);

  res.status(200).json(threadsWIthOneMessage[0]);
}
