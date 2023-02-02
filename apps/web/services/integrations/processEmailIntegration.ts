import { channelsIntegration } from '@prisma/client';
import { TwoWaySyncEvent, TwoWaySyncType } from 'queue/tasks/two-way-sync';
import prisma from 'client';
import axios from 'axios';
import { appendProtocol } from 'utilities/url';
import { getIntegrationUrl } from 'utilities/domain';

const LINEN_URL = appendProtocol(getIntegrationUrl());

export async function processEmailIntegration({
  channelId,
  messageId,
  threadId,
  event,
  integration,
  id,
}: TwoWaySyncType & {
  integration: channelsIntegration;
}) {
  if (event === 'newThread') {
    return 'not implemented yet';
  }
  if (event === 'threadClosed') {
    return 'not implemented yet';
  }
  if (event === 'threadReopened') {
    return 'not implemented yet';
  }
  if (event === 'newMessage') {
    return await processNewMessage(messageId!, integration, event);
  }
}

async function processNewMessage(
  messageId: string,
  integration: channelsIntegration,
  event: TwoWaySyncEvent
) {
  const message = await prisma.messages.findUnique({
    select: {
      body: true,
      externalMessageId: true,
      threads: {
        select: {
          externalThreadId: true,
          title: true,
          messages: {
            orderBy: { sentAt: 'asc' },
            take: 1,
            select: { author: { select: { displayName: true } } },
          },
        },
      },
      author: { select: { displayName: true } },
    },
    where: { id: messageId },
  });

  if (!message) {
    return 'MessageNotFound';
  }

  if (!message.threads || !message.threads.externalThreadId) {
    return 'ThreadNotFound';
  }

  if (message.externalMessageId) {
    return 'skip two-way sync due message is not from linen';
  }

  const data = {
    from: message.author?.displayName,
    to: message.threads.messages.find(Boolean)?.author?.displayName,
    body: message.body,
    title: message.threads.title,
    channelInbox: integration.externalId,
    externalThreadId: message.threads.externalThreadId,
  };

  return await callBridgeApi({ event, data });
}

async function callBridgeApi(data: any) {
  return await axios
    .post(`${LINEN_URL}/api/bridge/email/out`, data, {
      headers: { 'x-api-internal': process.env.INTERNAL_API_KEY! },
    })
    .then((r) => r.data)
    .catch((e) => {
      throw e.message || e.error;
    });
}
