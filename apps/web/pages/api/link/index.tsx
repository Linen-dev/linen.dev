import { NextApiRequest, NextApiResponse } from 'next/types';
import { prisma } from '@linen/database';

export async function create({ url }: { url: string }) {
  if (isArchiveUrl(url)) {
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    if (last.startsWith('p')) {
      const { length } = last;
      const id =
        last.slice(1, length - 6) + '.' + last.slice(length - 6, length);
      const thread = await prisma.threads.findFirst({
        where: {
          externalThreadId: id,
        },
      });
      if (thread) {
        return {
          status: 200,
          data: {
            incrementId: thread.incrementId,
          },
        };
      } else {
        return {
          status: 404,
        };
      }
    }
  }
  return {
    status: 400,
  };
}

function isArchiveUrl(input: string): boolean {
  const url = new URL(input);
  if (
    url.hostname.endsWith('.slack.com') &&
    url.pathname.startsWith('/archives/')
  ) {
    return true;
  }
  return false;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { status, data } = await create(request.body);
  return response.status(status).json(data || {});
}
