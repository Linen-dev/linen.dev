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
      return response.status(500).json({ error: 'missing current user' });
    }
    if (!push_token) {
      return response.status(500).json({ error: 'missing push token' });
    }
    if (!PUSH_SERVICE_KEY) {
      return response.status(500).json({ error: 'missing push service key' });
    }
    if (push_token !== PUSH_SERVICE_KEY) {
      return response.status(500).json({ error: 'invalid push token' });
    }

    if (channel_id) {
      const result = await Session.canAuthAccessChannel(
        current_user,
        channel_id
      );
      return response.status(result ? 200 : 403).json({});
    } else if (thread_id) {
      const result = await Session.canAuthAccessThread(current_user, thread_id);
      return response.status(result ? 200 : 403).json({});
    } else if (community_id) {
      const result = await Session.canAuthAccessCommunity(
        current_user,
        community_id
      );
      return response.status(result ? 200 : 403).json({});
    }
    return response.status(500).json({ error: 'missing parameters' });
  } catch (error: any) {
    console.error(error);
    return response.status(error.status || 500).json({});
  }
}
