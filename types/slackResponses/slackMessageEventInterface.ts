export interface SlackMessageEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event: Event;
  type: string;
  event_id: string;
  event_time: number;
  authorizations: Authorization[];
  is_ext_shared_channel: boolean;
  event_context: string;
}

export interface Event {
  client_msg_id: string;
  type: string;
  subtype?: string;
  message?: Event;
  previous_message?: Event;
  text: string;
  user: string;
  ts: string;
  team: string;
  blocks: Block[];
  channel: string;
  hidden?: boolean;
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
