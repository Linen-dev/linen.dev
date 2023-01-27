import prisma from 'client';
import WorkerSingleton from 'queue/singleton';
import { run, type JobHelpers } from 'graphile-worker';
import { downloadCert } from 'utilities/database';
import settings from '../settings';
import { slackChatSync } from 'services/slack/api/postMessage';

export async function runWorker() {
  await downloadCert();
  const runner = await run({
    ...settings,
    concurrency: 1,
    taskList: {
      ['two-way-sync']: twoWaySync,
    },
  });
  await runner.promise;
}

async function twoWaySync(payload: any, helpers: JobHelpers) {
  helpers.logger.info(JSON.stringify(payload));
  const result = await twoWaySyncJob(payload);
  helpers.logger.info(JSON.stringify(result));
}

type TwoWaySyncType = {
  event: 'newMessage' | 'newThread' | 'threadReopened' | 'threadClosed';
  id: string;
  channelId?: string;
  threadId?: string;
  messageId?: string;
};

async function twoWaySyncJob({
  channelId,
  messageId,
  threadId,
  id,
  event,
}: TwoWaySyncType) {
  console.log({ event });

  const channel = await prisma.channels.findFirst({
    where: {
      id: channelId,
    },
    include: {
      account: {
        include: { slackAuthorizations: true, discordAuthorizations: true },
      },
    },
  });

  if (!channel) {
    return 'channel not found';
  }
  if (!channel.account) {
    return 'account not found';
  }
  if (!channel.externalChannelId) {
    return 'channel belongs to linen';
  }
  // check if is slack
  if (channel.account.slackAuthorizations.length) {
    if (event !== 'newMessage' && event !== 'newThread') {
      return 'event not supported yet';
    }
    return slackChatSync({
      channel,
      threadId,
      messageId: messageId!,
      isThread: event === 'newThread',
      isReply: event === 'newMessage',
    });
  }
  // check if is discord
  if (channel.account.discordAuthorizations.length) {
    return 'discord is not implemented yet';
  }

  return 'account without authorization';
}

export async function createTwoWaySyncJob(payload: TwoWaySyncType) {
  const worker = await WorkerSingleton.getInstance();
  return await worker.addJob('two-way-sync', payload, {
    jobKey: `two-way-sync:${payload.id}`,
    maxAttempts: 2,
  });
}
