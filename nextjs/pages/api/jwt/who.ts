import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';

const PUSH_SERVICE_KEY = process.env.PUSH_SERVICE_KEY;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { push_token } = JSON.parse(request.body);
    if (!push_token) {
      throw 'missing push token';
    }
    if (!PUSH_SERVICE_KEY) {
      throw 'missing push service key';
    }
    if (push_token !== PUSH_SERVICE_KEY) {
      throw 'invalid push token';
    }

    const token = await Session.token(request);
    if (!token) {
      throw 'invalid authorization token';
    }

    if (!token.id) {
      throw 'missing user id on authorization token';
    }

    response.send(token.id);
  } catch (error: any) {
    console.error({ error });
    response.status(error.status || 500).end();
  } finally {
    response.end();
  }
}
