import { githubApp } from './inbound';
import Serializer from './helpers/serializer';
import { linenSdk } from './helpers/linen';

type TwoWaySyncType = any;
type TwoWaySyncEvent = string;
type channelsIntegration = { channelId: string; data: any; externalId: string };

type threadCreateType = {
  displayName?: string;
  body: string;
  title?: string;
  integrationId: number;
  owner: string;
  repo: string;
  channelId: string;
};

type messageCreateType = {
  displayName?: string | undefined;
  body: string;
  integrationId: number;
  externalThreadId: string;
};

type threadUpdateSchema = {
  displayName?: string | undefined;
  title?: string | undefined;
  body: string;
  integrationId: number;
  externalThreadId: string;
};

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
    return await processNewThread({ threadId, integration });
  }
  if (event === 'threadClosed') {
    return await processThreadUpdate({
      threadId,
      integration,
      event,
    });
  }
  if (event === 'threadReopened') {
    return await processThreadUpdate({
      threadId,
      integration,
      event,
    });
  }
  if (event === 'newMessage') {
    return await processNewMessage({
      messageId,
      integration,
    });
  }
  if (event === 'threadUpdated') {
    return await processThreadUpdate({
      threadId,
      integration,
      event,
    });
  }
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

  const data: messageCreateType = {
    displayName: message.author?.displayName || 'user',
    body: message.body,
    integrationId: Number(integration.externalId),
    externalThreadId: thread.externalThreadId,
  };

  const octokit = await githubApp.getInstallationOctokit(data.integrationId);

  const { issueNumber, owner, repo } = Serializer.extractDataFromExternalId(
    data.externalThreadId
  );

  const result = await octokit.rest.issues.createComment({
    body: _buildMessage(data.body, data.displayName),
    issue_number: issueNumber,
    owner,
    repo,
  });

  return `issue commented: ${result?.data?.id}`;
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

  const ownerRepo = integration.data as any;

  const data: threadCreateType = {
    body: thread.messages[0].body,
    integrationId: Number(integration.externalId),
    owner: ownerRepo.owner,
    repo: ownerRepo.repo,
    channelId: integration.channelId,
    ...(thread.title && { title: thread.title }),
    ...(thread.messages[0].author?.displayName && {
      displayName: thread.messages[0].author?.displayName,
    }),
  };

  const octokit = await githubApp.getInstallationOctokit(data.integrationId);

  const newThread = await octokit.rest.issues.create({
    title: data.title || data.body,
    body: _buildMessage(data.body, data.displayName),
    owner: data.owner,
    repo: data.repo,
  });

  const externalId = Serializer.buildExternalId(
    data.channelId,
    data.owner,
    data.repo,
    newThread.data.number
  );

  await linenSdk.updateThread({
    externalThreadId: externalId,
    threadId,
    channelId: data.channelId,
  });

  return `issue created: ${externalId}`;
}

async function processThreadUpdate({
  threadId,
  integration,
  event,
}: {
  threadId: string;
  integration: channelsIntegration;
  event: TwoWaySyncEvent;
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

  const data: threadUpdateSchema = {
    body: thread.messages[0].body,
    integrationId: Number(integration.externalId),
    externalThreadId: thread.externalThreadId,
    ...(!!thread.title && { title: thread.title }),
    ...(!!thread.messages[0].author?.displayName && {
      displayName: thread.messages[0].author?.displayName,
    }),
  };

  const octokit = await githubApp.getInstallationOctokit(data.integrationId);
  const { issueNumber, owner, repo } = Serializer.extractDataFromExternalId(
    data.externalThreadId
  );

  if (event === 'threadClosed') {
    await octokit.rest.issues.update({
      issue_number: issueNumber,
      state: 'closed',
      owner,
      repo,
    });
    return `issue closed: ${issueNumber}`;
  } else if (event === 'threadReopened') {
    await octokit.rest.issues.update({
      issue_number: issueNumber,
      state: 'open',
      owner,
      repo,
    });
    return `issue reopened: ${issueNumber}`;
  } else if (event === 'threadUpdated') {
    await octokit.rest.issues.update({
      issue_number: issueNumber,
      owner,
      repo,
      title: data.title,
    });
    return `issue updated: ${issueNumber}`;
  }

  return `unknown event: ${event}`;
}

function _buildMessage(body: string, displayName?: string) {
  if (displayName) {
    return `${displayName}: ${body}`;
  }
  return body;
}
