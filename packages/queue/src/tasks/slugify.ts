import type { JobHelpers } from 'graphile-worker';
import { prisma } from '@linen/database';
import { slugify as createSlug } from '@linen/utilities/string';
import { KeepAlive } from '../helpers/keep-alive';
import { Logger } from '../helpers/logger';

export const slugify = async (_: any, helpers: JobHelpers) => {
  const keepAlive = new KeepAlive(helpers);
  const logger = new Logger(helpers.logger);

  keepAlive.start();
  await slugifyTask(logger);
  keepAlive.end();
};

async function slugifyTask(logger: Logger) {
  let skip = 0;
  let threadsWithNoSlug = await findThreadsWithNoSlugs(skip);
  logger.info({ threadsWithNoSlug: threadsWithNoSlug.length });

  // weird case here when return 0 rows but there still more rows,
  // need to re-execute the process a few times to be really completed
  while (threadsWithNoSlug.length > 0) {
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
    logger.info({ threadsWithNoSlug: threadsWithNoSlug.length });
  }
}

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
