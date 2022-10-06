import type { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';

const PUSH_SERVICE_KEY = process.env.PUSH_SERVICE_KEY;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const { push_token, current_user, channel_id, thread_id, community_id } =
      JSON.parse(request.body);
    if (!current_user) {
      throw 'missing current user';
    }
    if (!push_token) {
      throw 'missing push token';
    }
    if (!PUSH_SERVICE_KEY) {
      throw 'missing push service key';
    }
    if (push_token !== PUSH_SERVICE_KEY) {
      throw 'invalid push token';
    }

    if (channel_id) {
      const result = await Session.canAuthAccessChannel(
        current_user,
        channel_id
      );
      response.status(result ? 200 : 403).end();
    } else if (thread_id) {
      const result = await Session.canAuthAccessThread(current_user, thread_id);
      response.status(result ? 200 : 403).end();
    } else if (community_id) {
      const result = await Session.canAuthAccessCommunity(
        current_user,
        community_id
      );
      response.status(result ? 200 : 403).end();
    } else {
      throw 'missing parameters';
    }
  } catch (error: any) {
    console.error({ error });
    response.status(error.status || 500).end();
  } finally {
    response.end();
  }
}
