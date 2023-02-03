import { Router, json, urlencoded } from 'express';
import githubApp from './github';
import { z } from 'zod';
import Serializer from './serializer';
import { integrationMiddleware } from '@linen/sdk';
import env from './config';

const messageSchema = z.object({
  displayName: z.string().min(1).optional(),
  body: z.string().min(1),
  integrationId: z.coerce.number().gt(0),
  externalThreadId: z.string().min(1),
});
const threadCreateSchema = z.object({
  displayName: z.string().min(1).optional(),
  body: z.string().min(1),
  title: z.string().min(1).optional(),
  integrationId: z.coerce.number().gt(0),
  owner: z.string().min(1),
  repo: z.string().min(1),
  channelId: z.string().uuid(),
});
const threadUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  body: z.string().min(1),
  title: z.string().min(1).optional(),
  integrationId: z.coerce.number().gt(0),
  externalThreadId: z.string().min(1),
});
const reqBodySchema = z.object({
  event: z.enum([
    'newMessage',
    'newThread',
    'threadReopened',
    'threadClosed',
    'threadUpdated',
  ]),
  data: z.any(),
});

async function processThread(data: any) {
  const thread = threadCreateSchema.parse(data);

  const octokit = await githubApp.getInstallationOctokit(thread.integrationId);

  const newThread = await octokit.rest.issues.create({
    title: thread.title || thread.body,
    body: buildMessage(thread.body, thread.displayName),
    owner: thread.owner,
    repo: thread.repo,
  });
  return {
    externalId: Serializer.buildExternalId(
      thread.channelId,
      thread.owner,
      thread.repo,
      newThread.data.number
    ),
  };
}

async function processMessage(data: any) {
  const message = messageSchema.parse(data);

  const octokit = await githubApp.getInstallationOctokit(message.integrationId);

  const { issueNumber, owner, repo } = Serializer.extractDataFromExternalId(
    message.externalThreadId
  );

  await octokit.rest.issues.createComment({
    body: buildMessage(message.body, message.displayName),
    issue_number: issueNumber,
    owner,
    repo,
  });
}

async function processThreadState(data: any, state: 'closed' | 'open') {
  const thread = threadUpdateSchema.parse(data);

  const octokit = await githubApp.getInstallationOctokit(thread.integrationId);

  const { issueNumber, owner, repo } = Serializer.extractDataFromExternalId(
    thread.externalThreadId
  );

  await octokit.rest.issues.update({
    issue_number: issueNumber,
    state,
    owner,
    repo,
  });
}

async function processThreadUpdate(data: any) {
  const thread = threadUpdateSchema.parse(data);

  const octokit = await githubApp.getInstallationOctokit(thread.integrationId);

  const { issueNumber, owner, repo } = Serializer.extractDataFromExternalId(
    thread.externalThreadId
  );

  await octokit.rest.issues.update({
    issue_number: issueNumber,
    owner,
    repo,
    title: thread.title,
  });
}

function buildMessage(body: string, displayName?: string) {
  if (displayName) {
    return `${displayName}: ${body}`;
  }
  return body;
}

const linenRouter = Router()
  // .use(json(), urlencoded({ extended: true }))
  .post(
    `/events`,
    integrationMiddleware(env.INTERNAL_API_KEY),
    async (req, res, next) => {
      try {
        const { event, data } = reqBodySchema.parse(req.body);
        if (event === 'newMessage') {
          await processMessage(data);
          // we may need the external message id in the future to allow us to update the message
          return res.status(200);
        }
        if (event === 'newThread') {
          const result = await processThread(data);
          return res.status(200).send(result);
        }
        if (event === 'threadClosed') {
          await processThreadState(data, 'closed');
          return res.status(200);
        }
        if (event === 'threadReopened') {
          await processThreadState(data, 'open');
          return res.status(200);
        }
        if (event === 'threadUpdated') {
          await processThreadUpdate(data);
          return res.status(200);
        }
        return res.status(405);
      } catch (error) {
        console.error(error);
        return next(500);
      }
    }
  );

export default linenRouter;
