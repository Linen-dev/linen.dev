import { accounts } from '@linen/database';
import { AccountType, AnonymizeType } from '@linen/types';

export default function createAccount(options?: Partial<accounts>): accounts {
  return {
    id: '1',
    createdAt: new Date(),
    syncStatus: 'NOT_STARTED',
    type: AccountType.PUBLIC,
    name: null,
    slackDomain: null,
    slackTeamId: null,
    discordDomain: null,
    discordServerId: null,
    communityInviteUrl: null,
    redirectDomain: null,
    communityUrl: null,
    brandColor: null,
    homeUrl: null,
    docsUrl: null,
    logoUrl: null,
    googleAnalyticsId: null,
    googleSiteVerification: null,
    anonymizeUsers: false,
    anonymize: AnonymizeType.NONE,
    premium: false,
    chat: 'NONE',
    integration: 'NONE',
    description: null,
    logoSquareUrl: null,
    faviconUrl: null,
    newChannelsConfig: 'NOT_HIDDEN',
    redirectDomainPropagate: null,
    updatedAt: null,
    searchSettings: null,
    ...options,
  };
}
