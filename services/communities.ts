import { findAccountByPath } from '../lib/models';
import { index as fetchThreads } from '../services/threads';
import { isSubdomainbasedRouting } from '../lib/util';
import { links } from '../constants/examples';
import { GetServerSidePropsContext } from 'next/types';

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

export async function communitiesGetServerSideProps(
  context: GetServerSidePropsContext
) {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const query = context.query;
  const page = Number(query.page) || 1;
  const host = context.req.headers.host || '';
  const isSubDomainRouting = isSubdomainbasedRouting(host);

  const result = await getThreadsByCommunityName(
    communityName,
    page,
    channelName
  );
  return { props: { ...result, isSubDomainRouting } };
}
