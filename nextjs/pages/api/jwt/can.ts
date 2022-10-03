import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';

const PUSH_SERVICE_KEY = process.env.PUSH_SERVICE_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { push_token, current_user, channel_id, thread_id, community_id } =
      JSON.parse(req.body);
    if (
      !current_user ||
      !push_token ||
      !PUSH_SERVICE_KEY ||
      push_token !== PUSH_SERVICE_KEY
    ) {
      throw 'bad token';
    }

    if (channel_id) {
      const result = await Session.canAuthAccessChannel(
        current_user,
        channel_id
      );
      res.status(result ? 200 : 403);
    } else if (thread_id) {
      const result = await Session.canAuthAccessThread(current_user, thread_id);
      res.status(result ? 200 : 403);
    } else if (community_id) {
      const result = await Session.canAuthAccessCommunity(
        current_user,
        community_id
      );
      res.status(result ? 200 : 403);
    } else {
      throw 'missing parameters';
    }
  } catch (error: any) {
    res.status(error.status || 500);
  } finally {
    res.end();
  }
}
