import { Account, Channel, EnumChangefreq, SitemapItem, Thread } from './types';

function resolveDomain(
  account: Pick<Account, 'discordDomain' | 'discordServerId' | 'slackDomain'>
) {
  return (
    account.slackDomain || account.discordDomain || account.discordServerId
  );
}

function resolveCommunityPrefix(
  account: Pick<Account, 'discordDomain' | 'discordServerId'>
) {
  return !!account.discordDomain || !!account.discordServerId ? 'd' : 's';
}

function setPriority(thread: Thread): number | undefined {
  return thread.messageCount > 1 ? 1.0 : 0.9;
}

export function parseThread(thread: Thread): SitemapItem {
  return {
    url: encodeURI(
      `/t/${thread.incrementId}/${(thread.slug || 'topic').toLowerCase()}`
    ),

    lastmodISO: new Date(
      Number(thread.lastReplyAt || thread.sentAt)
    ).toISOString(),

    priority: setPriority(thread),
  };
}

export function parseChannel(channel: Channel, idx?: number): SitemapItem {
  if (!idx) {
    return {
      url: encodeURI(`c/${channel.channelName}`),
      priority: 1.0,
      changefreq: EnumChangefreq.DAILY,
    };
  }
  return {
    url: encodeURI(`c/${channel.channelName}/${idx}`),
    priority: 0.8,
  };
}

export function parseThreadFreeTier(thread: Thread): SitemapItem {
  const letter = resolveCommunityPrefix(thread.channel.account!);
  const domain = resolveDomain(thread.channel.account!);

  return {
    url: encodeURI(
      `${letter}/${domain}/t/${thread.incrementId}/${(
        thread.slug || 'topic'
      ).toLowerCase()}`
    ),

    lastmodISO: new Date(
      Number(thread.lastReplyAt || thread.sentAt)
    ).toISOString(),

    priority: setPriority(thread),
  };
}

export function parseChannelFreeTier(
  channel: Channel,
  idx?: number
): SitemapItem {
  const letter = resolveCommunityPrefix(channel.account!);
  const domain = resolveDomain(channel.account!);

  if (!idx) {
    return {
      url: encodeURI(`${letter}/${domain}/c/${channel.channelName}`),
      priority: 1.0,
      changefreq: EnumChangefreq.DAILY,
    };
  }
  return {
    url: encodeURI(`${letter}/${domain}/c/${channel.channelName}/${idx}`),
    priority: 0.7,
  };
}

export function msToHuman(duration: number) {
  return Math.floor(duration / 1000) + 's';
}
