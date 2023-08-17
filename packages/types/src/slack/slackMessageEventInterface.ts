import { Block } from './Block';
import { MessageFile } from './MessageFile';
import { UserInfo } from './slackUserInfoInterface';

export interface SlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event:
    | SlackMessageEvent
    | SlackTeamJoinEvent
    | SlackMessageReactionRemovedEvent
    | SlackMessageReactionAddedEvent
    | SlackChannelCreatedEvent
    | SlackChannelRenameEvent
    | UserProfileUpdateEvent;
  type: string;
  event_id: string;
  event_time: number;
  authorizations: Authorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
}

export interface SlackTeamJoinEvent {
  type: string;
  user: UserInfo;
}

export interface SlackMessageEvent {
  client_msg_id: string;
  type: string;
  subtype?: string;
  message?: SlackMessageEvent;
  previous_message?: SlackMessageEvent;
  text: string;
  user: string;
  ts: string;
  team: string;
  blocks: Block[];
  channel: string;
  hidden?: boolean;
  deleted_ts?: string;
  event_ts: string;
  parent_user_id: string;
  channel_type: string;
  thread_ts?: string;
  files?: MessageFile[];
  app_id?: string;
  bot_id?: string;
  attachments?: {
    fallback: string;
    pretext: string;
    author_name: string;
    author_icon: string;
    title: string;
    text: string;
    footer: string;
  }[];
}
export interface SlackMessageReactionRemovedEvent {
  type: 'reaction_removed';
  user: string;
  reaction: string;
  item_user: string;
  item: {
    type: string;
    channel: string;
    ts: string;
  };
  event_ts: string;
}

export interface SlackMessageReactionAddedEvent {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item_user: string;
  item: {
    type: string;
    channel: string;
    ts: string;
  };
  event_ts: string;
}

export interface Text2 {
  type: string;
  text: string;
  verbatim: boolean;
}

export interface Field {
  type: string;
  text: string;
  verbatim: boolean;
}

export interface Element {
  type: string;
  elements: Element[];
  style: string;
  indent?: number;
  action_id: string;
  text: Text;
  value: string;
}

export interface Authorization {
  enterprise_id: any;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}

export interface SlackChannelCreatedEvent {
  type: string;
  channel: {
    id: string;
    name: string;
    created: number;
    creator: string;
  };
}

export interface SlackChannelRenameEvent {
  type: string;
  channel: {
    id: string;
    name: string;
    created: number;
  };
}

export interface UserProfileUpdateEvent {
  user: UserInfo;
  cache_ts: number;
  type: string;
  event_ts: string;
}
