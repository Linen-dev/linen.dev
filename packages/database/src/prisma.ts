import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './database';

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl({
          dbUrl: process.env.DATABASE_URL,
          cert: process.env.RDS_CERTIFICATE,
        }),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
