import { App, createNodeMiddleware } from 'octokit';
import env from './helpers/config';
import Serializer from './helpers/serializer';
import * as GitHubTypes from '@octokit/webhooks-types';
import { Router } from 'express';
import { linenSdk } from './helpers/linen';
import { stringify } from 'superjson';

const prefix = '/api/bridge/github';

export const githubApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
  // https://github.com/octokit/octokit.js/issues/2211
  oauth: {
    clientId: '',
    clientSecret: '',
  },
});

export const bridgeGithubRouter = Router()
  .use(
    createNodeMiddleware(githubApp, {
      pathPrefix: `${prefix}/in`,
    })
  )
  .get(`${prefix}/setup`, (req, res) => {
    console.log('req.query', req.query);
    console.log('req.params', req.params);
    console.log('req.path', req.path);
    res.redirect('https://linen.dev');
  });

githubApp.webhooks.on('issues.opened', async ({ payload }) => {
  try {
    await handleIssuesOpened(payload);
  } catch (error) {
    console.error(stringify(error));
  }
});

githubApp.webhooks.on('issues.closed', async ({ payload }) => {
  try {
    await handleIssuesClosed(payload);
  } catch (error) {
    console.error(stringify(error));
  }
});

githubApp.webhooks.on('issues.reopened', async ({ payload }) => {
  try {
    await handleIssuesReopened(payload);
  } catch (error) {
    console.error(stringify(error));
  }
});

githubApp.webhooks.on('issue_comment.created', async ({ payload }) => {
  try {
    await handleIssueCommentCreated(payload);
  } catch (error) {
    console.error(stringify(error));
  }
});

function isFromOurBot(sender: GitHubTypes.User) {
  return (
    sender.id === env.BOT_SENDER_ID || sender.login === env.BOT_SENDER_LOGIN
  );
}

// reusable between webhooks issue related
async function handleIssue(
  payload:
    | GitHubTypes.IssuesReopenedEvent
    | GitHubTypes.IssuesClosedEvent
    | GitHubTypes.IssuesOpenedEvent
) {
  const { channel, externalThreadId } = await handleCommon(payload);
  const user = await handleUser(payload.issue.user, channel);

  const thread = Serializer.githubIssueToLinenThread(
    payload.issue,
    user.id,
    channel.id,
    channel.accountId,
    externalThreadId
  );
  return thread;
}

// reusable: helper to identify channel and build thread external id
async function handleCommon(
  payload:
    | GitHubTypes.IssueCommentCreatedEvent
    | GitHubTypes.IssuesReopenedEvent
    | GitHubTypes.IssuesClosedEvent
    | GitHubTypes.IssuesOpenedEvent
) {
  if (isFromOurBot(payload.sender)) {
    throw new Error('skip messages from our bot');
  }

  if (!payload.installation) {
    throw new Error('Missing installation data');
  }
  // identify channel
  const channel = await linenSdk.getChannel({
    integrationId: String(payload.installation.id),
  });
  if (!channel) {
    throw new Error('channel not found');
  }

  const externalThreadId = Serializer.buildExternalId(
    channel.id,
    payload.repository.owner.login,
    payload.repository.name,
    payload.issue.number
  );
  return { channel, externalThreadId };
}

async function handleUser(
  user: GitHubTypes.User,
  channel: { id: string; accountId: string }
) {
  const parsedUser = Serializer.githubUserToLinenUser(user, channel.accountId);
  return await linenSdk.findOrCreateUser(parsedUser);
}

async function handleIssuesOpened(payload: GitHubTypes.IssuesOpenedEvent) {
  const thread = await handleIssue(payload);
  await linenSdk.createNewThread(thread);
}

async function handleIssuesClosed(payload: GitHubTypes.IssuesClosedEvent) {
  const thread = await handleIssue(payload);
  await linenSdk.updateThread({ ...thread, status: 'CLOSE' });
}

async function handleIssuesReopened(payload: GitHubTypes.IssuesReopenedEvent) {
  const thread = await handleIssue(payload);
  await linenSdk.updateThread({ ...thread, status: 'OPEN' });
}

async function handleIssueCommentCreated(
  payload: GitHubTypes.IssueCommentCreatedEvent
) {
  const { channel, externalThreadId } = await handleCommon(payload);
  const user = await handleUser(payload.comment.user, channel);

  const thread = await linenSdk.getThread({
    externalThreadId,
    channelId: channel.id,
  });
  if (!thread) {
    throw new Error('thread not found');
  }
  // create new message
  const message = Serializer.githubCommentToLinenMessage(
    payload,
    user.id,
    channel.id,
    channel.accountId,
    thread.id
  );
  await linenSdk.createNewMessage(message);
}
