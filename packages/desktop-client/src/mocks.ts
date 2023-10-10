import {
  AccountType,
  AnonymizeType,
  CommunityType,
  MessageFormat,
  SerializedAccount,
  SerializedThread,
  Settings,
  ThreadState,
} from '@linen/types';

export const mockAccount: SerializedAccount = {
  chat: null,
  communityType: null,
  id: '',
  newChannelsConfig: '',
  premium: false,
  syncStatus: '',
  type: AccountType.PUBLIC,
  anonymize: AnonymizeType.NONE,
  featurePreview: false,
};

export const mockSettings: Settings = {
  brandColor: '',
  chat: null,
  communityId: '',
  communityName: '',
  communityType: CommunityType.linen,
  communityUrl: '',
  docsUrl: '',
  homeUrl: '',
  logoUrl: '',
  name: null,
};

export const mockThread: SerializedThread = {
  channel: null,
  channelId: '',
  hidden: false,
  id: '',
  incrementId: 0,
  lastReplyAt: '',
  messageCount: 0,
  messages: [
    {
      attachments: [],
      author: null,
      body: 'loading...',
      externalId: '',
      id: '',
      mentions: [],
      messageFormat: MessageFormat.LINEN,
      reactions: [],
      sentAt: new Date().toISOString(),
      threadId: '',
      usersId: '',
    },
  ],
  page: null,
  pinned: false,
  sentAt: new Date().toISOString(),
  slug: '',
  state: ThreadState.OPEN,
  viewCount: 0,
};
