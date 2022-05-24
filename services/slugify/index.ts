import prisma from '../../client';
import { createSlug } from '../../lib/util';

export async function slugify() {
  try {
    let skip = 0;
    let threadsWithNoSlug = await findThreadsWithNoSlugs(skip);

    // weird case here when return 0 rows but there still more rows,
    // need to re-execute the process a few times to be really completed
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
    return {
      status: 200,
      body: threadsWithNoSlug[0],
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      body: { error: 'Internal server error' },
    };
  }
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
        take: 1,
      },
    },
    skip,
    take: 100,
  });
};
