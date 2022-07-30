import type { NextApiRequest, NextApiResponse } from 'next';

export function create(
  name: string,
  options?: object
): NextApiRequest | NextApiResponse {
  if (name === 'request') {
    const request = {
      method: 'GET',
      body: '{}',
      ...options,
    } as NextApiRequest;
    if (typeof request.body === 'object') {
      request.body = JSON.stringify(request.body);
    }
    return request;
  }
  if (name === 'response') {
    const response = {
      status: jest.fn().mockReturnThis() as unknown,
      json: jest.fn() as unknown,
      ...options,
    } as NextApiResponse;
    return response;
  }
  throw new Error(`Unknown factory name: ${name}`);
}
