import {
  AccountWithSlackAuthAndChannels,
  ConversationHistoryBody,
  UserInfo,
} from '@linen/types';

export type FetchTeamInfoResponseType = { body?: { team?: { url?: string } } };
export type FetchTeamInfoFnType = (
  token: string
) => Promise<FetchTeamInfoResponseType>;

export type JoinChannelFnType = (
  channel: string,
  token: string
) => Promise<any>;

export type GetSlackChannelsResponseType = {
  body?: { channels?: { id: string; name: string }[] };
};
export type GetSlackChannelsFnType = (
  teamId: string,
  token: string
) => Promise<GetSlackChannelsResponseType>;

export type ListUsersResponseType = {
  body?: {
    members?: UserInfo[];
    response_metadata?: { next_cursor?: string };
  };
};
export type ListUsersFnType = (
  token: string,
  userCursor?: string | null
) => Promise<ListUsersResponseType>;

export type FetchConversationsTypedFnType = (
  channel: string,
  token: string,
  cursor?: string | null,
  oldest?: string | null
) => Promise<ConversationHistoryBody>;

export type GetMembershipsFnType = (
  channel: string,
  token: string
) => Promise<string[]>;

export type FetchRepliesResponseType = { body?: { messages?: any[] } };
export type FetchRepliesFnType = (
  threadTs: string,
  channel: string,
  token: string
) => Promise<FetchRepliesResponseType>;

export type SyncWrapperFunctionsTypes = {
  fetchTeamInfo: FetchTeamInfoFnType;
  joinChannel: JoinChannelFnType;
  getSlackChannels: GetSlackChannelsFnType;
  listUsers: ListUsersFnType;
  fetchConversationsTyped: FetchConversationsTypedFnType;
  fetchReplies: FetchRepliesFnType;
  getMemberships: GetMembershipsFnType;
};

export interface SyncWrapperTypes extends SyncWrapperFunctionsTypes {
  account: AccountWithSlackAuthAndChannels;
  accountId: string;
  skipUsers: boolean;
  domain?: string;
  channelId?: string;
  fullSync?: boolean;
}
