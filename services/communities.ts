import {
  accountsWithChannels,
  channelsGroupByThreadCount,
  findAccountByPath,
} from '../lib/models';
import { index as fetchThreads } from '../services/threads';
import { links } from '../constants/examples';
import { GetStaticPropsContext } from 'next/types';

export const getThreadsByCommunityName = async (
  communityName: string,
  page: number,
  channelName?: string
) => {
  if (!communityName) {
    return { props: { statusCode: 404 } };
  }

  const account = await findAccountByPath(communityName);
  if (account === null) {
    return { props: { statusCode: 404 } };
  }
  const channels = account.channels;
  const defaultChannelName = channelName || 'general';

  const defaultChannel = account.channels.find(
    (c) => c.channelName === defaultChannelName
  );

  const channel = defaultChannel || channels[0];

  const channelId = channel.id;

  const [threadsReponse, channelsResponse] = await Promise.all([
    fetchThreads({ channelId, page: 1 }),
    channelsGroupByThreadCount(),
  ]);

  const { data, pagination } = threadsReponse;
  let { threads } = data;

  //Filter out channels with less than 10 threads
  const channelsWithMinThreads = channels.filter((c) => {
    if (c.id === channel.id) {
      return true;
    }

    const channelCount = channelsResponse.find((r) => {
      return r.channelId === c.id;
    });

    return channelCount && channelCount._count.id > 20;
  });

  threads = threads.filter((t) => t.messages.length > 0);
  const users = threads
    .map(({ messages }) => messages.map(({ author }) => author))
    .flat()
    .filter(Boolean);
  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: account.logoUrl || defaultSettings.logoUrl,
    googleAnalyticsId: account.googleAnalyticsId,
  };

  return {
    channelId,
    users,
    channels: channelsWithMinThreads,
    communityName,
    currentChannel: channel,
    slackUrl: account.slackUrl || '',
    slackInviteUrl: account.slackInviteUrl || '',
    settings,
    threads,
    pagination,
    page,
  };
};

export async function channelGetStaticProps(
  context: GetStaticPropsContext,
  isSubdomainbasedRouting: boolean
) {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const page = context.params?.page as string;

  const result = await getThreadsByCommunityName(
    communityName,
    Number(page) || 1,
    channelName
  );
  return {
    props: {
      ...result,
      isSubDomainRouting: isSubdomainbasedRouting,
    },
    revalidate: 60, // In seconds
  };
}

const SKIP_CACHING_ON_BUILD_STEP =
  process.env.SKIP_CACHING_ON_BUILD_STEP || false;

export async function channelGetStaticPaths(pathPrefix: string) {
  if (SKIP_CACHING_ON_BUILD_STEP) {
    console.log('hit skip caching on build step');
    return {
      paths: [],
      fallback: true,
    };
  }

  const accounts = await accountsWithChannels();
  const acc = accounts.filter((a) => a.channels.length > 0);
  let redirectDomains = acc
    .map((a) => {
      return a.redirectDomain;
    })
    .filter((x) => x);

  const paths = redirectDomains.concat(
    acc
      .map((a) => {
        return a.slackDomain;
      })
      .filter((x) => x)
  );

  return {
    paths: paths.map((p) => `${pathPrefix}/${p}/`),
    fallback: true,
  };
}
