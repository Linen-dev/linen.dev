import { buildPages } from './buildPages';
import { prisma } from '@linen/database';

export async function run() {
  const accounts = await prisma.accounts.findMany();
  for (const account of accounts) {
    await buildPages(account);
  }
}

export { buildPages };
