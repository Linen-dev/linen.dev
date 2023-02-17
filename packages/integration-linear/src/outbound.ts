import { threadFindResponseType } from '@linen/types';
import {
  createMessage,
  createThread,
  getStatusId,
  updateThread,
} from './helpers/linear';
import { linenSdk } from './helpers/linen';

type TwoWaySyncThreadEvent =
  | 'threadUpdated'
  | 'threadClosed'
  | 'threadReopened';
type TwoWaySyncEvent = 'newMessage' | 'newThread' | TwoWaySyncThreadEvent;
type channelsIntegration = { channelId: string; data: any; externalId: string };

export async function processLinearIntegration({
  channelId,
  messageId,
  threadId,
  event,
  integration,
  id,
}: any) {
  return await integrationMap[event as TwoWaySyncEvent]({
    threadId,
    integration,
    event,
    messageId,
  });
}

async function processNewMessage({
  messageId,
  integration,
}: {
  messageId: string;
  integration: channelsIntegration;
}) {
  const message = await linenSdk.getMessage({
    messageId,
  });

  if (!message) {
    return 'MessageNotFound';
  }

  if (!message.threadId) {
    return 'ThreadNotFound';
  }

  const thread = await linenSdk.getThread({
    channelId: message.channelId,
    threadId: message.threadId,
  });

  if (!thread || !thread.externalThreadId) {
    return 'thread not found';
  }

  if (message.externalMessageId) {
    return 'skip two-way sync due message is not from linen';
  }

  // create comment
  await createMessage({
    accessToken: integration.data.access_token,
    body: message.body,
    createAsUser: message.author?.displayName || 'linen-user',
    issueId: thread.externalThreadId,
    displayIconUrl: message.author?.profileImageUrl || undefined,
  });

  return `issue commented`;
}

async function processNewThread({
  threadId,
  integration,
}: {
  threadId: string;
  integration: channelsIntegration;
}) {
  const thread = await linenSdk.getThread({
    channelId: integration.channelId,
    threadId,
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

  // create issue
  const newThread = await createThread({
    accessToken: integration.data.access_token,
    description: thread.messages[0].body,
    createAsUser: thread.messages[0].author?.displayName || 'linen-user',
    displayIconUrl: thread.messages[0].author?.profileImageUrl || undefined,
    title: thread.messages[0].body,
    teamId: integration.externalId,
  });

  if (newThread?.id) {
    await linenSdk.updateThread({
      externalThreadId: newThread.id,
      threadId,
      channelId: integration.channelId,
    });
  }

  return `issue created`;
}

async function processThreadUpdate({
  threadId,
  integration,
  event,
}: {
  threadId: string;
  integration: channelsIntegration;
  event: TwoWaySyncThreadEvent;
}) {
  const thread = await linenSdk.getThread({
    channelId: integration.channelId,
    threadId,
  });

  if (!thread) {
    return 'ThreadNotFound';
  }

  if (!thread.messages.length) {
    return 'ThreadNotFound';
  }

  if (!thread.externalThreadId) {
    return 'missing thread external id';
  }

  return await threadHandleMap[event](thread, integration);
}

const integrationMap = {
  threadUpdated: processThreadUpdate,
  threadClosed: processThreadUpdate,
  threadReopened: processThreadUpdate,
  newThread: processNewThread,
  newMessage: processNewMessage,
};

const threadHandleMap = {
  threadUpdated: async (
    thread: threadFindResponseType,
    integration: channelsIntegration
  ) => {
    if (!thread?.title) {
      return 'currently we only update thread title';
    }
    await updateThread({
      accessToken: integration.data.access_token,
      issueId: thread.externalThreadId!,
      title: thread.title,
    });
    return `issue updated`;
  },
  threadClosed: async (
    thread: threadFindResponseType,
    integration: channelsIntegration
  ) => {
    const stateId = await getStatusId({
      accessToken: integration.data.access_token,
      status: 'completed',
    });
    if (!stateId) {
      return 'state not found';
    }
    await updateThread({
      accessToken: integration.data.access_token,
      issueId: thread?.externalThreadId!,
      stateId,
    });
    return `issue closed`;
  },
  threadReopened: async (
    thread: threadFindResponseType,
    integration: channelsIntegration
  ) => {
    const stateId = await getStatusId({
      accessToken: integration.data.access_token,
      status: 'started',
    });
    if (!stateId) {
      return 'state not found';
    }
    await updateThread({
      accessToken: integration.data.access_token,
      issueId: thread?.externalThreadId!,
      stateId,
    });
    return `issue reopened`;
  },
};
