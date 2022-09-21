import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthFromSession } from 'utilities/session';
import * as userService from 'services/users';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const requester = await getAuthFromSession(request, response);
  if (request.method === 'GET') {
    const users = await userService.findUsersByName(requester, request.query.q);
    return response.status(200).json(users);
  }

  return response.status(405).end();
}
