import { hideEmptyChannels } from 'lib/channel';
import { fetchToken } from './sync/fetchToken';
import { syncChannels } from './sync/syncChannels';
import { syncUsers } from './sync/syncUsers';
import { fetchAllTopLevelMessages } from './sync/fetchAllTopLevelMessages';
import { saveAllThreads } from './sync/saveAllThreads';
import {
  AccountWithSlackAuthAndChannels,
  ConversationHistoryBody,
} from '@linen/types';
import { syncMemberships } from './sync/membership';

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
  response_metadata?: { next_cursor?: string };
  body?: { members?: any[] };
};
export type ListUsersFnType = (
  token: string,
  userCursor?: string | null
) => Promise<ListUsersResponseType>;

export type FetchConversationsTypedFnType = (
  channel: string,
  token: string,
  userCursor?: string | null
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

export async function syncWrapper({
  account,
  domain,
  accountId,
  channelId,
  skipUsers,
  fullSync,
  fetchTeamInfo,
  joinChannel,
  getSlackChannels,
  listUsers,
  fetchConversationsTyped,
  fetchReplies,
  getMemberships,
}: SyncWrapperTypes) {
  const token = await fetchToken({
    account,
    domain,
    accountId,
    fetchTeamInfo,
  });

  // create and join channels
  const channels = await syncChannels({
    account,
    token,
    accountId,
    channelId,
    joinChannel,
    getSlackChannels,
  });

  //paginate and find all the users
  const usersInDb = await syncUsers({
    accountId,
    token,
    account,
    skipUsers,
    listUsers,
  });

  for (const channel of channels) {
    if (!channel.externalChannelId) {
      continue;
    }

    await syncMemberships({
      accountId,
      channelId: channel.id,
      externalChannelId: channel.externalChannelId,
      token,
      getMemberships,
    });
    //fetch and save all top level conversations
    await fetchAllTopLevelMessages({
      channel,
      account,
      usersInDb,
      token,
      fullSync,
      fetchConversationsTyped,
    });

    // Save all threads
    // only fetch threads with single message
    // There will be edge cases where not all the threads are sync'd if you cancel the script
    await saveAllThreads({ channel, token, usersInDb, fetchReplies });
  }

  await hideEmptyChannels(accountId);
}
