import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';

const PUSH_SERVICE_KEY = process.env.PUSH_SERVICE_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { push_token } = JSON.parse(req.body);
    if (!push_token || !PUSH_SERVICE_KEY || push_token !== PUSH_SERVICE_KEY) {
      throw 'missing token';
    }

    const token = await Session.token(req);
    if (!token) {
      throw { status: 401 };
    }

    const { id } = token;
    res.send(id);
  } catch (error: any) {
    res.status(error.status || 500);
  } finally {
    res.end();
  }
}
