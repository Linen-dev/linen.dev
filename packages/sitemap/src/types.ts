import { SitemapItemLoose, EnumChangefreq } from 'sitemap';

export type Account = {
  id: string;
  name: string | null;
  redirectDomain: string | null;
  discordDomain: string | null;
  slackDomain: string | null;
  discordServerId: string | null;
};

export type Thread = {
  incrementId: number;
  lastReplyAt: bigint | null;
  messageCount: number;
  resolutionId: string | null;
  sentAt: bigint;
  viewCount: number;
  slug: string | null;
  channel: {
    channelName: string;
    account?: Account | null;
  };
};

export type Channel = {
  channelName: string;
  pages: number | null;
  account?: Account | null;
};

export type SitemapItem = SitemapItemLoose;
export { EnumChangefreq };

export type Logger = (...args: any[]) => void;
