import type { NextApiRequest, NextApiResponse } from 'next';

export function preflight(
  request: NextApiRequest,
  response: NextApiResponse,
  allowedMethods: ('GET' | 'PUT' | 'POST' | 'DELETE')[] = ['GET', 'POST', 'PUT']
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', allowedMethods.join(','));
  response.setHeader(
    'Access-Control-Allow-Headers',
    'authorization,content-type'
  );
  response.setHeader('Content-Length', '0');
  response.status(204);
  response.end();
}

export function cors(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'authorization,content-type'
  );
}
