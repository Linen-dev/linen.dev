import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { createSlug } from '../../../lib/util';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let skip = 0;
  let threadsWithNoSlug = await prisma.slackThreads.findMany({
    where: {
      slug: null,
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

  while (threadsWithNoSlug.length > 0) {
    console.log('looping');
    skip += 100;
    for (let i = 0; i < threadsWithNoSlug.length; i++) {
      const thread = threadsWithNoSlug[i];
      if (thread.messages.length === 0) {
        console.log({ thread });
        continue;
      }
      const message = thread.messages[0];
      const slug = createSlug(message.body);
      await prisma.slackThreads.update({
        where: {
          id: thread.id,
        },
        data: {
          slug,
        },
      });
    }
    threadsWithNoSlug = await prisma.slackThreads.findMany({
      where: {
        slug: null,
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

  console.log(threadsWithNoSlug[0]);

  res.status(200).json(threadsWithNoSlug[0]);
}

const get = () => {};
