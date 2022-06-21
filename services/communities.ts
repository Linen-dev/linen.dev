import {
  accountsWithChannels,
  channelIndex,
  channelsGroupByThreadCount,
  findAccountByPath,
  findChannelsWithSingleMessages,
  findMessagesFromChannel,
} from '../lib/models';
import { index as fetchThreads } from '../services/threads';
import { links } from '../constants/examples';
import { GetStaticPropsContext } from 'next/types';
import { stripProtocol } from '../utilities/url';
import { accounts, channels, MessagesViewType } from '@prisma/client';
import { NotFound } from '../utilities/response';

export type Settings = {
  communityType: string;
  googleAnalyticsId?: string | undefined;
  name: string | null;
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  messagesViewType: MessagesViewType;
};

function buildSettings(account: accounts): Settings {
  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  //TODO: Refactor a lot of account settings is duplicate
  const communityType = account.discordServerId ? 'discord' : 'slack';

  const settings = {
    name: account.name,
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: account.logoUrl || defaultSettings.logoUrl,
    messagesViewType: account.messagesViewType || MessagesViewType.THREADS,
    ...(account.premium &&
      account.googleAnalyticsId && {
        googleAnalyticsId: account.googleAnalyticsId,
      }),
    communityType: communityType,
  };
  return settings;
}

async function getThreadsAndUsers({
  account,
  channelId,
  channels,
  page,
}: {
  account: accounts;
  channelId: string;
  page: number;
  channels: channels[];
}) {
  const [threadsResponse, channelsResponse] = await Promise.all([
    fetchThreads({ channelId, page, account }),
    channelsGroupByThreadCount(account.id),
  ]);

  const { data, pagination } = threadsResponse;
  let { threads } = data;

  //Filter out channels with less than 20 threads
  const channelsWithMinThreads = channels
    .filter((c) => !c.hidden)
    .filter((c) => {
      if (c.id === channelId) {
        return true;
      }

      const channelCount = channelsResponse.find((r) => {
        return r.channelId === c.id;
      });

      return channelCount && channelCount.count > 2;
    });

  threads = threads.filter((t) => t.messages.length > 0);
  const users = threads
    .map(({ messages }) => messages.map(({ author }) => author))
    .flat()
    .filter(Boolean);

  return { users, threads, pagination, channelsWithMinThreads, messages: null };
}

function identifyChannel({
  channelName,
  channels,
}: {
  channelName?: string;
  channels: channels[];
}) {
  const defaultChannelName =
    channelName || channels.find((c) => c.default)?.channelName;

  const defaultChannel =
    channels.find((c) => c.channelName === defaultChannelName) ||
    channels.find((c) => c.channelName === 'general');

  //TODO: we should only default to a channel if there are more than 20 threads
  const channel = defaultChannel || channels[0];

  return { channel };
}

async function resolveMessageViewType({
  account,
  channel,
  channels,
  page,
}: {
  account: accounts;
  channels: channels[];
  channel: channels;
  page: number;
}) {
  if (account.messagesViewType === MessagesViewType.MESSAGES) {
    return await getMessagesAndUsers({
      channelId: channel.id,
      channels,
      page,
    });
  } else {
    return await getThreadsAndUsers({
      account,
      channelId: channel.id,
      channels,
      page,
    });
  }
}

async function getMessagesAndUsers({
  channelId,
  channels,
  page,
}: {
  channelId: string;
  channels: channels[];
  page?: number;
}) {
  const { messages, total, currentPage, pages } = await findMessagesFromChannel(
    { channelId, page }
  );
  const channelsWithMinThreads = await findChannelsWithSingleMessages({
    channels,
  });

  return {
    users: messages.map((message) => message.author),
    threads: null,
    pagination: {
      totalCount: total,
      pageCount: pages,
      currentPage,
      perPage: 10,
    },
    channelsWithMinThreads,
    messages: messages.map((message) => {
      return {
        ...message,
        createdAt: message.createdAt.toISOString(),
        sentAt: message.sentAt.toISOString(),
      };
    }),
  };
}

function buildInviteUrl(account: accounts) {
  if (account.discordServerId) {
    return `https://discord.com/channels/${account.discordServerId}`;
  } else {
    return account.slackInviteUrl || '';
  }
}

export const getThreadsByCommunityName = async (
  communityName: string,
  page: number,
  channelName?: string
) => {
  if (!communityName) {
    return null;
  }

  const account = await findAccountByPath(communityName);
  if (account === null) {
    return null;
  }
  const channels = await channelIndex(account.id, { hidden: false });
  if (channels.length === 0) {
    return null;
  }

  const { channel } = identifyChannel({ channels, channelName });

  const { users, threads, pagination, channelsWithMinThreads, messages } =
    await resolveMessageViewType({ account, channel, page, channels });

  const settings = buildSettings(account);

  return {
    channelId: channel.id,
    users,
    channels: channelsWithMinThreads,
    communityName,
    currentChannel: channel,
    slackUrl: account.slackUrl || '',
    slackInviteUrl: buildInviteUrl(account),
    settings,
    threads,
    messages,
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
  if (!result) {
    return NotFound();
  }
  return {
    props: {
      ...result,
      communityName,
      isSubDomainRouting: isSubdomainbasedRouting,
    },
    revalidate: 60, // In seconds
  };
}

const SKIP_CACHING_ON_BUILD_STEP =
  process.env.SKIP_CACHING_ON_BUILD_STEP === 'true' || false;

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
      return a.redirectDomain && stripProtocol(a.redirectDomain);
    })
    .filter(Boolean);

  const paths = redirectDomains.concat(
    acc
      .map((a) => {
        return a.slackDomain;
      })
      .filter(Boolean)
  );

  return {
    paths: paths.map((p) => `${pathPrefix}/${p}/`),
    fallback: true,
  };
}
