import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import { prisma } from '@linen/database';

jest.mock('@linen/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

describe('singleton', () => {
  it('is defined', () => {
    expect(prisma).toBeDefined();
  });
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
