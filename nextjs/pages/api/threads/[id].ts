import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { withSentry } from '@sentry/nextjs';
import { findThreadById } from 'lib/threads';
import serializeThread from 'serializers/thread';
import PermissionsService from 'services/permissions';
import type { ThreadState } from '@prisma/client';

async function update(threadId: string, state: ThreadState, title: string) {
  await prisma.threads.update({
    where: { id: threadId },
    data: { state, title },
  });
}

async function get(threadId: string) {
  const thread = await findThreadById(threadId);
  if (!thread) {
    return;
  }
  return serializeThread(thread);
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const threadId = request.query.id as string;
  const permissions = await PermissionsService.getAccessThread({
    request,
    response,
    threadId,
  });
  if (!permissions.access) {
    return response.status(403).end();
  }
  if (!permissions.can_access_thread) {
    return response.status(403).end();
  }

  if (request.method === 'GET') {
    const thread = await get(threadId);
    if (thread) {
      response.status(200).json(thread);
    } else {
      response.status(404);
    }
    return response.end();
  }
  if (request.method === 'PUT') {
    if (!permissions.manage) {
      return response.status(403).end();
    }
    const { state, title } = JSON.parse(request.body);
    await update(threadId, state, title);
    return response.status(200).end();
  }
  return response.status(405).end();
}

export default withSentry(handler);
