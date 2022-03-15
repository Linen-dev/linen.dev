import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { createSlug } from '../../../lib/util';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let skip = 0;
  let threadsWithNoSlug = await findThreadsWithNoSlugs(skip);

  while (threadsWithNoSlug.length > 0) {
    console.log('looping');
    skip += 100;
    const slugsTransaction = threadsWithNoSlug.map((t) => {
      const message = t.messages[0];
      const slug = createSlug(message?.body || '');
      return prisma.slackThreads.update({
        where: {
          id: t.id,
        },
        data: {
          slug,
        },
      });
    });

    await prisma.$transaction(slugsTransaction);

    threadsWithNoSlug = await findThreadsWithNoSlugs(skip);
  }

  console.log(threadsWithNoSlug[0]);
  res.status(200).json(threadsWithNoSlug[0]);
}

const findThreadsWithNoSlugs = (skip: number) => {
  return prisma.slackThreads.findMany({
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
};
