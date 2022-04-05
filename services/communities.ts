import { accountsWithSlackDomain, findAccountByPath } from '../lib/models';
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

  const { data, pagination } = await fetchThreads({ channelId, page: 1 });
  let { threads } = data;

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
  };

  return {
    channelId,
    users,
    channels,
    communityName,
    currentChannel: channel,
    slackUrl: account.slackUrl,
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

export async function channelGetStaticPaths(pathPrefix: string) {
  const accounts = await accountsWithSlackDomain();
  let paths = accounts
    .map((a) => {
      return a.redirectDomain;
    })
    .filter((x) => x);

  paths.concat(
    accounts
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
