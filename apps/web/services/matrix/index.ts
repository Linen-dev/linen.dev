import { prisma } from '@linen/database';
import axios from 'axios';

async function getIntegration(id: string, model: 'threads' | 'messages') {
  const query = {
    where: { id },
    select: {
      channel: {
        select: {
          account: {
            select: {
              integrationMatrix: true,
            },
          },
        },
      },
    },
  };
  const matrix =
    model === 'threads'
      ? await prisma.threads.findUnique(query)
      : await prisma.messages.findUnique(query);
  return matrix?.channel.account?.integrationMatrix.find((i) => i.enabled);
}

export async function matrixNewThread({
  threadId,
}: {
  threadId: string;
}): Promise<any> {
  const integration = await getIntegration(threadId, 'threads');
  if (!integration) {
    return;
  }

  const thread = await prisma.threads.findUnique({
    include: {
      messages: {
        select: {
          body: true,
          attachments: { select: { internalUrl: true } },
          author: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      channel: { select: { externalChannelId: true } },
    },
    where: { id: threadId },
  });

  if (!thread) {
    return;
  }
  if (thread.externalThreadId) {
    return; // if it has externalId means that the message came from matrix
  }
  if (!thread.channel.externalChannelId) {
    return; // missing channel external id
  }
  if (!thread.messages.length) {
    return; // skip thread without messages
  }

  const body = [
    thread.messages[0].body,
    thread.messages[0].attachments
      .map((attach) => attach.internalUrl)
      .join('\n'),
  ]
    .filter((e) => e)
    .join('\n');

  if (!body.length) {
    return; // skip empty body
  }

  const data: LinenMatrixPayload = {
    body,
    user: thread.messages[0].author?.displayName || 'unknown',
    channelId: thread.channel.externalChannelId,
    threadId: null,
  };

  try {
    const { data: matrixMessage } = await axios.post(
      integration.matrixUrl,
      data,
      {
        headers: {
          'content-type': 'application/json',
          ...(!!integration.matrixToken
            ? { Authorization: integration.matrixToken }
            : {}),
        },
      }
    );
    if (matrixMessage.ok) {
      await prisma.threads.update({
        where: { id: threadId },
        data: { externalThreadId: matrixMessage.event_id },
      });
    }
  } catch (e: any) {
    console.error(e.response.status, e.response.data);
  }
}

export async function matrixNewMessage({
  messageId,
}: {
  messageId: string;
}): Promise<any> {
  const integration = await getIntegration(messageId, 'messages');
  if (!integration) {
    return;
  }

  const message = await prisma.messages.findUnique({
    where: { id: messageId },
    select: {
      externalMessageId: true,
      body: true,
      attachments: { select: { internalUrl: true } },
      author: { select: { displayName: true } },
      threads: {
        select: {
          externalThreadId: true,
          channel: { select: { externalChannelId: true } },
        },
      },
    },
  });

  if (!message) {
    return;
  }
  if (message.externalMessageId) {
    return; // if it has externalId means that the message came from matrix
  }
  if (!message.threads?.channel.externalChannelId) {
    return; // missing channel external id
  }
  if (!message.threads?.externalThreadId) {
    return; // missing thread external id
  }

  const body = [
    message.body,
    message.attachments.map((attach) => attach.internalUrl).join('\n'),
  ]
    .filter((e) => e)
    .join('\n');

  if (!body.length) {
    return; // skip empty body
  }

  const data: LinenMatrixPayload = {
    body,
    user: message.author?.displayName || 'unknown',
    channelId: message.threads.channel.externalChannelId,
    threadId: message.threads.externalThreadId,
  };

  try {
    const { data: matrixMessage } = await axios.post(
      integration.matrixUrl,
      data,
      {
        headers: {
          'content-type': 'application/json',
          ...(!!integration.matrixToken
            ? { Authorization: integration.matrixToken }
            : {}),
        },
      }
    );
    if (matrixMessage.ok) {
      await prisma.messages.update({
        where: { id: messageId },
        data: { externalMessageId: matrixMessage.event_id },
      });
    }
  } catch (e: any) {
    console.error(e.response.status, e.response.data);
  }
}

type LinenMatrixPayload = {
  body: string;
  user: string;
  channelId: string;
  threadId: string | null;
};
