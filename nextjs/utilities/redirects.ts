import type { accounts, channels } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import { RedirectTo } from './response';
import { encodeCursor } from 'utilities/cursor';
import { appendProtocol } from './url';

export function resolveCrawlerRedirect({
  isSubdomainbasedRouting,
  communityName,
  channelName,
  settings,
  channel,
}: {
  isSubdomainbasedRouting: boolean;
  communityName: string;
  channelName?: string;
  settings: Settings;
  channel: channels;
}) {
  let url = buildChannelUrl({
    isSubdomainbasedRouting,
    settings,
    communityName,
    channelName,
    channel,
  });

  url += `/${encodeCursor('asc:gt:0')}`;

  return {
    redirect: {
      destination: url,
      permanent: false,
    },
  };
}

export function shouldRedirectToDomain({
  account,
  communityName,
  isSubdomainbasedRouting,
}: {
  account: accounts;
  communityName: string;
  isSubdomainbasedRouting: boolean;
}) {
  if (process.env.SKIP_REDIRECT === 'true') return false;
  return (
    account.premium &&
    !!account.redirectDomain &&
    communityName !== account.redirectDomain &&
    !isSubdomainbasedRouting
  );
}

export function redirectChannelToDomain({
  account,
  communityName,
  settings,
  channelName,
  channel,
}: {
  account: accounts;
  communityName: string;
  settings: Settings;
  channelName: string;
  channel: channels;
}) {
  return RedirectTo(
    appendProtocol(
      account.redirectDomain +
        buildChannelUrl({
          isSubdomainbasedRouting: true,
          settings,
          communityName,
          channelName,
          channel,
        })
    )
  );
}

export function redirectThreadToDomain({
  account,
  communityName,
  settings,
  threadId,
  slug,
}: {
  account: accounts;
  communityName: string;
  settings: Settings;
  threadId: string;
  slug?: string;
}) {
  return RedirectTo(
    appendProtocol(
      account.redirectDomain +
        buildThreadUrl({
          isSubdomainbasedRouting: true,
          settings,
          communityName,
          threadId,
          slug,
        })
    )
  );
}

function buildChannelUrl({
  isSubdomainbasedRouting,
  settings,
  communityName,
  channelName,
  channel,
}: {
  isSubdomainbasedRouting: boolean;
  settings: Settings;
  communityName: string;
  channelName: string | undefined;
  channel: channels;
}) {
  let url = isSubdomainbasedRouting
    ? ''
    : `/${settings.prefix}/${communityName}`;

  url += channelName ? `/c/${channelName}` : `/c/${channel.channelName}`;
  return url;
}

function buildThreadUrl({
  isSubdomainbasedRouting,
  settings,
  communityName,
  threadId,
  slug,
}: {
  isSubdomainbasedRouting: boolean;
  settings: Settings;
  communityName: string;
  threadId: string;
  slug: string | undefined;
}) {
  let url = isSubdomainbasedRouting
    ? ''
    : `/${settings.prefix}/${communityName}`;

  url += `/t/${threadId}` + (slug ? `/${slug}` : ``);
  return url;
}
