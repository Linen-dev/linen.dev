import serializeThread from '../serializers/thread';
import { links } from '../constants/examples';
import {
  threadIndex,
  threadCount,
  channelIndex,
  findAccountById,
  findThreadById,
} from '../lib/models';
import { isSubdomainbasedRouting } from '../lib/util';

interface IndexProps {
  channelId: string;
  page: number;
}

export async function index({ channelId, page }: IndexProps) {
  const take = 10;
  const skip = (page - 1) * take;
  const [threads, total] = await Promise.all([
    threadIndex(channelId, take, skip),
    threadCount(channelId),
  ]);

  return {
    data: {
      threads: threads.map(serializeThread),
    },
    pagination: {
      totalCount: total,
      pageCount: Math.ceil(total / take),
      currentPage: page,
      perPage: take,
    },
  };
}

// Function for getServerSideProps
// extracted here to be resused in both /[threadId]/index and /[slug]/index
export async function getThreadById(threadId: string, host: string) {
  const isSubDomainRouting = isSubdomainbasedRouting(host);
  const id = parseInt(threadId);
  const thread = await findThreadById(id);

  if (!thread || !thread.channel.accountId) {
    return {
      notFound: true,
    };
  }

  const [channels, account] = await Promise.all([
    channelIndex(thread.channel.accountId),
    findAccountById(thread.channel.accountId),
  ]);

  if (!account) {
    return {
      notFound: true,
    };
  }

  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: account.logoUrl || defaultSettings.logoUrl,
  };

  // "https://papercups-test.slack.com/archives/C01JSB67DTJ/p1627841694000600"
  const threadUrl =
    account.slackUrl +
    '/archives/' +
    thread.channel.slackChannelId +
    '/p' +
    (parseFloat(thread.slackThreadTs) * 1000000).toString();

  return {
    props: {
      ...serializeThread(thread),
      threadId,
      currentChannel: thread.channel,
      channels,
      slackUrl: account.slackUrl,
      communityName: account.slackDomain,
      threadUrl,
      settings,
      viewCount: thread.viewCount,
      isSubDomainRouting,
    },
  };
}
