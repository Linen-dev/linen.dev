import { type JobHelpers } from 'graphile-worker';
import { prisma } from '@linen/database';
import { slugify as createSlug } from '@linen/utilities/string';

const findThreadsWithNoSlugs = (skip: number) => {
  return prisma.threads.findMany({
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

export const slugify = async (payload: any, helpers: JobHelpers) => {
  let skip = 0;
  let threadsWithNoSlug = await findThreadsWithNoSlugs(skip);
  helpers.logger.info(`threadsWithNoSlug ${threadsWithNoSlug.length}`);

  // weird case here when return 0 rows but there still more rows,
  // need to re-execute the process a few times to be really completed
  while (threadsWithNoSlug.length > 0) {
    helpers.logger.info('looping');
    skip += 100;
    const slugsTransaction = threadsWithNoSlug.map((t) => {
      const message = t.messages[0];
      const slug = createSlug(message?.body || '');
      return prisma.threads.update({
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
};
