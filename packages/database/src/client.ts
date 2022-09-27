import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './cert-helper';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl({
          dbUrl: process.env.DATABASE_URL,
          cert: process.env.RDS_CERTIFICATE,
        }),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
