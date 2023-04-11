import { now } from 'utilities/auth/react/utils';
import { getToken } from 'utilities/auth/server/tokens';

jest.mock('jose');

jest.mock('utilities/auth/server/tokens', () => {
  const originalModule = jest.requireActual('utilities/auth/server/tokens');
  return {
    __esModule: true,
    ...originalModule,
    signToken: jest.fn().mockImplementation((val) => {
      return JSON.stringify({ data: { ...val }, exp: now() });
    }),
    verifyToken: jest
      .fn()
      .mockImplementation(async (val, _) => JSON.parse(val)),
    refreshTokenAction: jest.fn().mockImplementation((req, _) => {
      const token = getToken(req);
      const newToken = JSON.parse(token!);
      newToken.data.exp = now();
      return { newToken: JSON.stringify(newToken) };
    }),
  };
});

export {};
