import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './utilities/database';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    ...(process.env.DATABASE_URL && {
      datasources: {
        db: {
          url: getDatabaseUrl({
            dbUrl: process.env.DATABASE_URL,
            cert: process.env.RDS_CERTIFICATE,
          }),
        },
      },
    }),
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
