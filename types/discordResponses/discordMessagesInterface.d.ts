export interface DiscordMessage {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  author: Author;
  attachments?: Attachments[];
  embeds: any[]; // TODO: field used for gif https://discord.com/developers/docs/resources/channel#embed-object
  mentions?: Author[];
  mention_roles?: any[]; // TODO: https://discord.com/developers/docs/topics/permissions#role-object
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp?: null;
  flags?: number;
  components?: null[] | null;
  message_reference?: MessageReference;
  referenced_message?: DiscordMessage;
  thread?: Thread;
  nonce?: number;
  guild_id?: string;
  webhook_id?: string;
  application_id?: string;
  member?: any; // TODO: https://discord.com/developers/docs/resources/guild#guild-member-object
  mention_channels?: any[]; // TODO: https://discord.com/developers/docs/resources/channel#channel-mention-object
  reactions?: Reactions[]; // TODO: https://discord.com/developers/docs/resources/channel#reaction-object
  activity?: any; // TODO: https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure
  application?: any; // TODO: https://discord.com/developers/docs/resources/application#application-object
  interaction?: any; // TODO: https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure
  sticker_items?: any[];
}
export interface Author {
  id: string;
  username: string;
  avatar?: string;
  avatar_decoration?: null;
  discriminator: string;
  public_flags?: number;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
}
export interface MessageReference {
  channel_id?: string;
  guild_id?: string;
  message_id?: string;
  fail_if_not_exists?: boolean;
}
export interface ReferencedMessage {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  author: Author;
  attachments?: null[] | null;
  embeds?: null[] | null;
  mentions?: Author[] | null;
  mention_roles?: null[] | null;
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp?: null;
  flags: number;
  components?: null[] | null;
  thread: Thread;
}

export interface Thread {
  id: string;
  guild_id?: string;
  parent_id?: string;
  owner_id?: string;
  type: number;
  name?: string;
  last_message_id?: string;
  thread_metadata?: ThreadMetadata;
  message_count?: number;
  member_count?: number;
  rate_limit_per_user?: number;
  flags?: number;
  position?: number;
  permission_overwrites?: PermissionOverwrites[];
  topic?: string;
  nsfw?: boolean;
  bitrate?: number;
  user_limit?: number;
  recipients?: Author[];
  icon?: string;
  application_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  default_auto_archive_duration?: number;
  permissions?: string;
  member?: any; // thread member object for the current user, if they have joined the thread, only included on certain API endpoints
}
export interface ThreadMetadata {
  archived: boolean;
  archive_timestamp: string;
  auto_archive_duration: number;
  locked: boolean;
  create_timestamp?: string;
  invitable?: boolean;
}

interface Attachments {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: ?number;
  width?: ?number;
  ephemeral?: boolean;
}

interface Reactions {
  count: number;
  me: boolean;
  emoji: {
    id?: string;
    name?: string;
  };
}

interface PermissionOverwrites {
  id: string;
  type: number;
  allow: string;
  deny: string;
}

export interface DiscordThreads {
  id: string;
  guild_id: string;
  parent_id: string;
  owner_id: string;
  type: number;
  name: string;
  last_message_id: string;
  thread_metadata: ThreadMetadata;
  message_count: number;
  member_count: number;
  rate_limit_per_user: number;
  flags: number;
}

export interface ThreadMetadata {
  archived: boolean;
  archive_timestamp: string;
  auto_archive_duration: number;
  locked: boolean;
  create_timestamp?: string;
}

export interface guildChannelsResponse {}

export interface discordChannel {
  id: string;
  type: number;
  name: string;
  position: number;
  parent_id?: string | null;
  guild_id: string;
  last_message_id?: string | null;
  topic?: null;
  rate_limit_per_user?: number | null;
  nsfw?: boolean | null;
  bitrate?: number | null;
  user_limit?: number | null;
  rtc_region?: null;
  permission_overwrites?: {
    id: string;
    type: number;
    allow: string;
    deny: string;
  }[];
}

// Todos:
// Make sure we handle private threads and don't render them
export interface GuildActiveThreads {
  threads?: DiscordThreads[] | null;
  members?: null[] | null;
}
