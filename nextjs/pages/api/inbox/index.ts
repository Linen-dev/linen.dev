import { NextApiRequest, NextApiResponse } from 'next/types';
import PermissionsService from 'services/permissions';

export function index() {
  return {
    status: 200,
    data: {
      threads: [],
    },
  };
}

const handlers = {
  async index(request: NextApiRequest, response: NextApiResponse) {
    try {
      const permissions = await PermissionsService.get({
        request,
        response,
        params: request.query,
      });
      if (!permissions.inbox) {
        return response.status(401).json({});
      }
      const { status, data } = await index();
      response.status(status).json(data);
    } catch (exception) {
      response.status(500).json({});
    }
  },
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'GET') {
    return handlers.index(request, response);
  }
  return response.status(404).json({});
}
