import { prisma } from '@linen/database';
import axios from 'axios';
import type { JobHelpers } from 'graphile-worker';

export const checkPropagation = async (_: any, { logger }: JobHelpers) => {
  const domains = await prisma.accounts.findMany({
    select: { id: true, redirectDomain: true, redirectDomainPropagate: true },
    where: { redirectDomain: { not: null } },
  });
  logger.info('domains: ' + domains.length);

  const promises = domains.map(async (account) => {
    if (account.redirectDomain) {
      const res = await axios
        .head(`https://${account.redirectDomain}/api/health`)
        .catch((e) => {
          return { status: 500 };
        });
      // it was ok, now isn't
      if (res.status !== 200 && !!account.redirectDomainPropagate) {
        await prisma.accounts.update({
          where: { id: account.id },
          data: { redirectDomainPropagate: false },
        });
        // probably new domain, is ok, it is mark as propagate
      } else if (res.status === 200 && !account.redirectDomainPropagate) {
        await prisma.accounts.update({
          where: { id: account.id },
          data: { redirectDomainPropagate: true },
        });
      }
    }
  });
  await Promise.allSettled(promises);
};
