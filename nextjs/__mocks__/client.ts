import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';
import { URL } from 'url';
import { v4 } from 'uuid';

const generateDatabaseURL = (schema: string) => {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('please provide a database url');
  }
  const url = new URL(process.env.TEST_DATABASE_URL);
  url.searchParams.append('schema', schema);
  return url.toString();
};

const schemaId = `test-${v4()}`;
const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma');

const url = generateDatabaseURL(schemaId);
process.env.TEST_DATABASE_URL = url;
export const prisma = new PrismaClient({
  datasources: { db: { url } },
});

beforeAll(() => {
  execSync(`${prismaBinary} db push`, {
    env: {
      ...process.env,
      DATABASE_URL: generateDatabaseURL(schemaId),
    },
  });
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE;`
  );
  await prisma.$disconnect();
});

export default prisma;
