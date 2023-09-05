import { SerializedSearchSettings } from './SerializedSearchSettings';
import { makeEnum } from './utils/makeEnum';

export const AnonymizeType = makeEnum({
  NONE: 'NONE',
  MEMBERS: 'MEMBERS',
  ALL: 'ALL',
});
export type AnonymizeType = typeof AnonymizeType[keyof typeof AnonymizeType];

export const ChatType = makeEnum({
  NONE: 'NONE',
  MANAGERS: 'MANAGERS',
  MEMBERS: 'MEMBERS',
});
export type ChatType = typeof ChatType[keyof typeof ChatType];

export const CommunityType = makeEnum({
  discord: 'discord',
  slack: 'slack',
  linen: 'linen',
});
export type CommunityType = typeof CommunityType[keyof typeof CommunityType];

export const AccountType = makeEnum({
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
});
export type AccountType = typeof AccountType[keyof typeof AccountType];

export type Settings = {
  communityId: string;
  communityType: CommunityType;
  googleAnalyticsId?: string | undefined;
  googleSiteVerification?: string | undefined;
  name: string | null;
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  communityUrl: string;
  communityInviteUrl: string;
  communityName: string;
  redirectDomain?: string;
  prefix?: 'd' | 's';
  chat: ChatType | null;
};

export interface SerializedAccount {
  id: string;
  type: AccountType;
  name?: string;
  description?: string;
  homeUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  logoSquareUrl?: string;
  faviconUrl?: string;
  redirectDomain?: string;
  brandColor?: string;
  premium: boolean;
  featurePreview: boolean;
  googleAnalyticsId?: string;
  syncStatus: string;
  communityType: CommunityType | null;
  anonymizeUsers?: boolean;
  anonymize: AnonymizeType;
  hasAuth?: boolean;
  slackDomain?: string;
  discordDomain?: string;
  discordServerId?: string;
  chat: ChatType | null;
  communityUrl?: string;
  newChannelsConfig: string;
  redirectDomainPropagate?: boolean;
  search?: SerializedSearchSettings;
}

export const AccountIntegration = makeEnum({
  NONE: 'NONE',
  SLACK: 'SLACK',
  DISCORD: 'DISCORD',
});
export type AccountIntegration =
  typeof AccountIntegration[keyof typeof AccountIntegration];

export type accounts = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  type: AccountType;
  name: string | null;
  description: string | null;
  slackDomain: string | null;
  discordDomain: string | null;
  discordServerId: string | null;
  slackTeamId: string | null;
  communityInviteUrl: string | null;
  redirectDomain: string | null;
  communityUrl: string | null;
  syncStatus: string;
  brandColor: string | null;
  homeUrl: string | null;
  docsUrl: string | null;
  logoUrl: string | null;
  logoSquareUrl: string | null;
  faviconUrl: string | null;
  premium: boolean;
  featurePreview: boolean;
  googleAnalyticsId: string | null;
  googleSiteVerification: string | null;
  anonymizeUsers: boolean;
  anonymize: AnonymizeType;
  newChannelsConfig: string;
  redirectDomainPropagate: boolean | null;
  searchSettings: string | null;
  chat: ChatType;
  integration: AccountIntegration;
};
