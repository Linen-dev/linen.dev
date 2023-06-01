import {
  AccountType,
  CommunityType,
  SerializedAccount,
  Settings,
} from '@linen/types';

export const mockAccount: SerializedAccount = {
  chat: null,
  communityType: null,
  id: '',
  newChannelsConfig: '',
  premium: false,
  syncStatus: '',
  type: AccountType.PUBLIC,
};

export const mockSettings: Settings = {
  brandColor: '',
  chat: null,
  communityId: '',
  communityInviteUrl: '',
  communityName: '',
  communityType: CommunityType.linen,
  communityUrl: '',
  docsUrl: '',
  homeUrl: '',
  logoUrl: '',
  name: null,
};
