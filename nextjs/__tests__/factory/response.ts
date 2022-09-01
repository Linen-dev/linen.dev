import type { NextApiResponse } from 'next';

export default function createResponse(options?: object) {
  const response = {
    status: jest.fn().mockReturnThis() as unknown,
    json: jest.fn() as unknown,
    getHeader: jest.fn() as unknown,
    setHeader: jest.fn() as unknown,
    ...options,
  } as NextApiResponse;
  return response;
}
