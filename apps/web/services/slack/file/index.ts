import { ConversationHistoryBody } from '@linen/types';
import type {
  FetchConversationsTypedFnType,
  FetchRepliesFnType,
  FetchRepliesResponseType,
  FetchTeamInfoFnType,
  FetchTeamInfoResponseType,
  GetMembershipsFnType,
  GetSlackChannelsFnType,
  GetSlackChannelsResponseType,
  JoinChannelFnType,
  ListUsersFnType,
  ListUsersResponseType,
} from '../types';
import fs from 'fs';

export class SlackFileAdapter {
  filesPath: string;
  // we will use to persist key-value map of channel-external–id and channel-name
  channelsMap: Record<string, string>;
  repliesMap: Record<string, any[]>;

  constructor(filesPath: string) {
    this.filesPath = filesPath;
    this.channelsMap = {};
    this.repliesMap = {};
  }

  _readParseFile(filename: string) {
    const data = fs.readFileSync(this.filesPath + '/' + filename, 'utf8');
    return JSON.parse(data);
  }

  _listFiles(channelName: string) {
    return fs.readdirSync(this.filesPath + '/' + channelName + '/', 'utf8');
  }

  fetchTeamInfo: FetchTeamInfoFnType = async (
    token: string
  ): Promise<FetchTeamInfoResponseType> => {
    // exported files doesn't include team info
    return {};
  };

  getSlackChannels: GetSlackChannelsFnType = async (
    teamId: string,
    token: string
  ): Promise<GetSlackChannelsResponseType> => {
    const channelsFile = this._readParseFile('channels.json') as any[];
    this.channelsMap = channelsFile.reduce(
      (prev, curr) => ({ ...prev, [curr.id]: curr.name }),
      {}
    );
    return {
      body: { channels: channelsFile },
    };
  };

  getMemberships: GetMembershipsFnType = async (
    channelId: string,
    token: string
  ): Promise<string[]> => {
    const channelsFile = this._readParseFile('channels.json') as any[];
    return channelsFile.find((f) => f.id === channelId)?.members;
  };

  joinChannel: JoinChannelFnType = async (channel: string, token: string) => {};

  listUsers: ListUsersFnType = async (
    token: string,
    userCursor?: string | null | undefined
  ): Promise<ListUsersResponseType> => {
    return {
      body: { members: this._readParseFile('users.json') },
    };
  };

  _keepReplies = (message: any) => {
    this.repliesMap[message.thread_ts] = [
      ...(this.repliesMap[message.thread_ts] || []),
      message,
    ];
  };

  _filterTopLevelOnly = async (message: { thread_ts?: string; ts: string }) => {
    if (!message.thread_ts) return true;
    if (message.thread_ts && message.thread_ts === message.ts) return true;
    this._keepReplies(message);
    return false;
  };

  fetchConversationsTyped: FetchConversationsTypedFnType = async (
    channelExternalId: string,
    token: string,
    cursor?: string | null | undefined
  ): Promise<ConversationHistoryBody> => {
    const channelName = this.channelsMap[channelExternalId];
    if (!channelName) {
      console.error('channel not found');
      return { messages: [], has_more: false, ok: true };
    }

    const channelFiles = this._listFiles(channelName).sort();
    let next_cursor = '';
    if (cursor) {
      const idx = channelFiles.indexOf(cursor);
      if (channelFiles.length > idx) {
        next_cursor = channelFiles[idx + 1];
      }
    } else {
      if (channelFiles.length) {
        cursor = channelFiles[0];
        if (channelFiles.length > 1) {
          next_cursor = channelFiles[1];
        }
      }
    }
    const messagesFile = this._readParseFile(channelName + '/' + cursor).filter(
      this._filterTopLevelOnly
    );

    return {
      has_more: !!next_cursor,
      messages: messagesFile,
      ok: true,
      response_metadata: { next_cursor },
    };
  };

  fetchReplies: FetchRepliesFnType = async (
    threadTs: string,
    channel: string,
    token: string
  ): Promise<FetchRepliesResponseType> => {
    return {
      body: {
        messages: this.repliesMap[threadTs] || [],
      },
    };
  };
}
