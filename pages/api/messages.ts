import { findMessagesFromChannel } from '@/lib/models';
import { NextApiRequest, NextApiResponse } from 'next/types';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'GET') {
    return getMessagesFromChannel(request, response);
  }
  return response.status(404);
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
        createdAt: message.createdAt.toISOString(),
        sentAt: message.sentAt.toISOString(),
      };
    })
  );
}
