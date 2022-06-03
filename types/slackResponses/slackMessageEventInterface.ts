import { UserInfo } from './slackUserInfoInterface';

export interface SlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event: SlackMessageEvent | SlackTeamJoinEvent;
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

export interface Edited {
  user: string;
  ts: string;
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
  edited?: Edited;
  blocks: Block[];
  channel: string;
  hidden?: boolean;
  deleted_ts?: string;
  event_ts: string;
  parent_user_id: string;
  channel_type: string;
  thread_ts?: string;
}

export interface Block {
  type: string;
  block_id: string;
  elements: Element[];
}

export interface Element {
  type: string;
  elements: Element2[];
}

export interface Element2 {
  type: string;
  text: string;
}

export interface Authorization {
  enterprise_id: any;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}
