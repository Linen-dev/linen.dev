export enum ChatType {
  NONE = 'NONE',
  MANAGERS = 'MANAGERS',
  MEMBERS = 'MEMBERS',
}

export enum CommunityType {
  'discord' = 'discord',
  'slack' = 'slack',
  'linen' = 'linen',
}

export enum AccountType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

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
  googleAnalyticsId?: string;
  syncStatus: string;
  communityType: CommunityType | null;
  anonymizeUsers?: boolean;
  hasAuth?: boolean;
  slackDomain?: string;
  discordDomain?: string;
  discordServerId?: string;
  communityInviteUrl?: string;
  chat: ChatType | null;
  communityUrl?: string;
  newChannelsConfig: string;
}

export interface Permissions {
  access: boolean;
  inbox: boolean;
  starred: boolean;
  chat: boolean;
  manage: boolean;
  channel_create: boolean;
  is_member: boolean;
  accountId: string | null;
  token: string | null;
  user: any | null;
  auth: {
    id: string;
    email: string;
  } | null;
}
