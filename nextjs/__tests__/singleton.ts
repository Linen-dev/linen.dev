import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../client';

jest.mock('../client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
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
