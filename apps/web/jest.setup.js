import '@testing-library/jest-dom/extend-expect';
import { prisma } from '@linen/database';
import { TextEncoder, TextDecoder } from 'util';

if (typeof window !== 'undefined') {
  window.fetch = jest.fn().mockResolvedValue({});
  const intersectionObserverMock = () => ({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = jest
    .fn()
    .mockImplementation(intersectionObserverMock);
}

global.setImmediate = jest.useRealTimers;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
