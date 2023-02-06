import { channelsIntegration, Prisma, prisma } from '@linen/database';
import axios from 'axios';
import { TwoWaySyncEvent, TwoWaySyncType } from 'queue/tasks/two-way-sync';
import { getIntegrationUrl } from 'utilities/domain';
import { appendProtocol } from 'utilities/url';

const LINEN_URL = appendProtocol(getIntegrationUrl());

export async function processGithubIntegration({
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
    return await processNewThread(threadId!, integration, event);
  }
  if (event === 'threadClosed') {
    return await processThreadUpdate(threadId!, integration, event);
  }
  if (event === 'threadReopened') {
    return await processThreadUpdate(threadId!, integration, event);
  }
  if (event === 'newMessage') {
    return await processNewMessage(messageId!, integration, event);
  }
  if (event === 'threadUpdated') {
    return await processThreadUpdate(messageId!, integration, event);
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
      threads: { select: { externalThreadId: true } },
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
    displayName: message.author?.displayName,
    body: message.body,
    integrationId: integration.externalId,
    externalThreadId: message.threads.externalThreadId,
  };

  return await callBridgeApi({ event, data });
}

async function processNewThread(
  threadId: string,
  integration: channelsIntegration,
  event: TwoWaySyncEvent
) {
  const thread = await prisma.threads.findUnique({
    select: {
      externalThreadId: true,
      title: true,
      channelId: true,
      messages: {
        select: {
          body: true,
          externalMessageId: true,
          author: { select: { displayName: true } },
        },
        orderBy: { sentAt: 'asc' },
        take: 1,
      },
    },
    where: { id: threadId },
  });

  if (!thread) {
    return 'ThreadNotFound';
  }

  if (!thread.messages.length) {
    return 'ThreadNotFound';
  }

  if (thread.externalThreadId) {
    return 'skip two-way sync due thread is not from linen';
  }

  const ownerRepo = integration.data as Prisma.JsonObject;

  const data = {
    body: thread.messages[0].body,
    integrationId: integration.externalId,
    owner: ownerRepo.owner,
    repo: ownerRepo.repo,
    channelId: thread.channelId,
    ...(thread.title && { title: thread.title }),
    ...(thread.messages[0].author?.displayName && {
      displayName: thread.messages[0].author?.displayName,
    }),
  };

  const newThread = await callBridgeApi({ event, data });
  if (newThread.externalId) {
    await prisma.threads.update({
      where: { id: threadId },
      data: { externalThreadId: newThread.externalId },
    });
  }
}

async function processThreadUpdate(
  threadId: string,
  integration: channelsIntegration,
  event: TwoWaySyncEvent
) {
  const thread = await prisma.threads.findUnique({
    select: {
      externalThreadId: true,
      title: true,
      state: true,
      messages: {
        select: {
          body: true,
          externalMessageId: true,
          author: { select: { displayName: true } },
        },
        orderBy: { sentAt: 'asc' },
        take: 1,
      },
    },
    where: { id: threadId },
  });

  if (!thread) {
    return 'ThreadNotFound';
  }

  if (!thread.messages.length) {
    return 'ThreadNotFound';
  }

  // if (thread.externalThreadId) {
  //   return 'skip two-way sync due thread is not from linen';
  // }

  const data = {
    body: thread.messages[0].body,
    integrationId: integration.externalId,
    externalThreadId: thread.externalThreadId,
    ...(!!thread.title && { title: thread.title }),
    ...(!!thread.messages[0].author?.displayName && {
      displayName: thread.messages[0].author?.displayName,
    }),
  };

  return await callBridgeApi({ event, data });
}

async function callBridgeApi(data: any) {
  return await axios
    .post(`${LINEN_URL}/api/bridge/github/out/events`, data, {
      headers: { 'x-api-internal': process.env.INTERNAL_API_KEY! },
    })
    .then((r) => r.data)
    .catch((e) => {
      throw e.message || e.error;
    });
}
