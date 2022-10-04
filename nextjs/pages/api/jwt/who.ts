import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';

const PUSH_SERVICE_KEY = process.env.PUSH_SERVICE_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { push_token } = JSON.parse(req.body);
    if (!push_token) {
      throw 'missing push token';
    }
    if (!PUSH_SERVICE_KEY) {
      throw 'missing push service key';
    }
    if (push_token !== PUSH_SERVICE_KEY) {
      throw 'invalid push token';
    }

    const token = await Session.token(req);
    if (!token) {
      throw 'invalid authorization token';
    }

    if (!token.id) {
      throw 'missing user id on authorization token';
    }

    res.send(token.id);
  } catch (error: any) {
    console.error({ error });
    res.status(error.status || 500);
  } finally {
    res.end();
  }
}
