import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from './database';

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var prisma: PrismaClient | undefined;
}

const settings: any = {
  log: ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl({
        dbUrl: process.env.DATABASE_URL,
        cert: process.env.RDS_CERTIFICATE,
      }),
    },
  },
};

function initPrisma() {
  return process.env.NODE_ENV === 'test'
    ? new PrismaClient(settings)
    : skipForBrowser();
}

function skipForBrowser() {
  return typeof window === 'undefined'
    ? global.prisma || new PrismaClient(settings)
    : global.prisma!;
}

export const prisma = initPrisma();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
