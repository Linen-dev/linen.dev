import { findMessagesFromChannel } from 'lib/models';
import { NextApiRequest, NextApiResponse } from 'next/types';
import serialize from 'serializers/thread';
import { messageParams, saveMessage } from 'services/messages/messages';
import { withSentry } from 'utilities/sentry';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    return getMessagesFromChannel(request, response);
  } else if (request.method === 'POST') {
    return create(request, response);
  }
  return response.status(404).json({});
}

async function getMessagesFromChannel(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  const channelId = request.query.channelId as string;
  const page = request.query.page as string;

  const { messages } = await findMessagesFromChannel({
    channelId,
    page: Number(page),
  });

  return response.status(200).json(
    messages.map((message) => {
      return {
        ...message,
        createdAt: message?.createdAt?.toISOString(),
        sentAt: message?.sentAt?.toISOString(),
      };
    })
  );
}

export async function create(
  request: NextApiRequest,
  response: NextApiResponse<any>
) {
  const { body, channelId, threadId } = JSON.parse(request.body);
  if (!channelId) {
    return response.status(400).json({ error: 'channel id is required' });
  }

  //TODO: check empty attachment
  if (!body) {
    return response.status(400).json({ error: 'message is required' });
  }

  const threadWithMessage = await saveMessage({
    body,
    channelId,
    threadId,
  });

  return response.status(200).json('success');
}

export default withSentry(handler);
