import { findArgAndParse } from '../../utilities/processArgs';
import prisma from '../../client';
import { buildSitemapQueries } from '../../utilities/sitemap';
import {
  healthCheck as dynamoHealthCheck,
  memoize,
} from '../../utilities/dynamoCache';
import { getThreadsByCommunityName } from '../../services/communities';
import { getThreadById } from '../../services/threads';
import axios from 'axios';

async function callCommunities(params: {
  channelName: string;
  communityName: string;
  page: string;
}) {
  const communityName = params.communityName as string;
  const channelName = params.channelName as string;
  const page = params.page as string;

  await getThreadsByCommunityNameMemo(
    communityName,
    Number(page) || 1,
    channelName
  );
}

async function callThreads(params: {
  threadId: string;
  communityName: string;
}) {
  const threadId = params.threadId as string;
  const communityName = params.communityName as string;
  await getThreadByIdMemo(threadId, communityName);
}

const logging = true; //process.env.LOG === 'true';

function log(...args: any) {
  if (logging) {
    console.log(...args);
  }
}

function catchFailure(obj: any) {
  return function (reason: any) {
    log(obj, reason);
  };
}

function prefixProtocol(url: string) {
  return url.startsWith('http') ? url : 'https://' + url;
}

const defaultSettings = {
  crawlCommunities: true,
  crawlThreads: true,
  promiseQueue: 25,
};

async function crawler() {
  logging && console.time('crawler');
  const settings = { ...defaultSettings };

  const accounts = await prisma.accounts.findMany({
    where: {
      OR: [
        { redirectDomain: { not: null } },
        { slackDomain: { not: null } },
        { discordDomain: { not: null } },
      ],
    },
    select: {
      id: true,
      discordDomain: true,
      slackDomain: true,
      redirectDomain: true,
    },
  });

  for (const { id: accountId, ...domain } of accounts) {
    if (!!domain.redirectDomain) {
      try {
        await axios.get(prefixProtocol(domain.redirectDomain));
      } catch (error: any) {
        console.log(error?.message ? error.message : JSON.stringify(error));
        continue;
      }
    }

    const communityName =
      domain.redirectDomain || domain.slackDomain || domain.discordDomain;
    if (!communityName) {
      log(accountId, 'has no domain');
      continue;
    }

    const channels = await buildSitemapQueries.channelsFromAccountId(accountId);

    for (const { channelName, id: channelId } of channels) {
      const threads = await buildSitemapQueries.byChannelId(channelId);

      const queue: Promise<any>[] = [];
      for (const { incrementId } of threads) {
        if (settings.crawlThreads) {
          const params = {
            communityName,
            threadId: String(incrementId),
          };
          log(params);
          queue.push(callThreads(params).catch(catchFailure(params)));
        }
        if (queue.length === settings.promiseQueue) {
          await Promise.all(queue);
          queue.splice(0, settings.promiseQueue);
        }
      }

      const pages =
        Math.floor(threads.length / 10) + (threads.length % 10 > 0 ? 1 : 0);
      for (let i = 0; i < pages; i++) {
        if (settings.crawlCommunities) {
          const params = {
            communityName,
            channelName,
            page: String(i + 1),
          };
          log(params);
          queue.push(callCommunities(params).catch(catchFailure(params)));
        }
        if (queue.length === settings.promiseQueue) {
          await Promise.all(queue);
          queue.splice(0, settings.promiseQueue);
        }
      }

      await Promise.all(queue);
    }
  }
  logging && console.timeEnd('crawler');
}

const getThreadsByCommunityNameMemo = memoize(getThreadsByCommunityName);
const getThreadByIdMemo = memoize(getThreadById);

dynamoHealthCheck().then((health) => {
  log({ health });
  if (health) {
    crawler();
  }
});
