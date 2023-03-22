export interface DiscordMessage {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  author: DiscordAuthor;
  attachments?: DiscordAttachments[];
  embeds: any[]; // TODO: field used for gif https://discord.com/developers/docs/resources/channel#embed-object
  mentions?: DiscordAuthor[];
  mention_roles?: any[]; // TODO: https://discord.com/developers/docs/topics/permissions#role-object
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp?: null;
  flags?: number;
  components?: null[] | null;
  message_reference?: DiscordMessageReference;
  referenced_message?: DiscordMessage;
  thread?: DiscordThread;
  nonce?: number;
  guild_id?: string;
  webhook_id?: string;
  application_id?: string;
  member?: any; // TODO: https://discord.com/developers/docs/resources/guild#guild-member-object
  mention_channels?: any[]; // TODO: https://discord.com/developers/docs/resources/channel#channel-mention-object
  reactions?: DiscordReactions[]; // TODO: https://discord.com/developers/docs/resources/channel#reaction-object
  activity?: any; // TODO: https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure
  application?: any; // TODO: https://discord.com/developers/docs/resources/application#application-object
  interaction?: any; // TODO: https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure
  sticker_items?: any[];
}

export interface DiscordAuthor {
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

interface DiscordMessageReference {
  channel_id?: string;
  guild_id?: string;
  message_id?: string;
  fail_if_not_exists?: boolean;
}

export interface DiscordThread {
  id: string;
  guild_id?: string;
  parent_id?: string;
  owner_id?: string;
  type: number;
  name?: string;
  last_message_id?: string;
  thread_metadata?: DiscordThreadMetadata;
  message_count?: number;
  member_count?: number;
  rate_limit_per_user?: number;
  flags?: number;
  position?: number;
  permission_overwrites?: DiscordPermissionOverwrites[];
  topic?: string;
  nsfw?: boolean;
  bitrate?: number;
  user_limit?: number;
  recipients?: DiscordAuthor[];
  icon?: string;
  application_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  default_auto_archive_duration?: number;
  permissions?: string;
  member?: any; // thread member object for the current user, if they have joined the thread, only included on certain API endpoints
  member_ids_preview: string[];
  total_message_sent: number;
}

interface DiscordThreadMetadata {
  archived: boolean;
  archive_timestamp: string;
  auto_archive_duration: number;
  locked: boolean;
  create_timestamp?: string;
  invitable?: boolean;
}

export interface DiscordAttachments {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
}

interface DiscordReactions {
  count: number;
  me: boolean;
  emoji: {
    id?: string;
    name?: string;
  };
}

interface DiscordPermissionOverwrites {
  id: string;
  type: number;
  allow: string;
  deny: string;
}

interface DiscordThreads {
  id: string;
  guild_id: string;
  parent_id: string;
  owner_id: string;
  type: number;
  name: string;
  last_message_id: string;
  thread_metadata: DiscordThreadMetadata;
  message_count: number;
  member_count: number;
  rate_limit_per_user: number;
  flags: number;
}

interface DiscordThreadMetadata {
  archived: boolean;
  archive_timestamp: string;
  auto_archive_duration: number;
  locked: boolean;
  create_timestamp?: string;
  invitable?: boolean;
}

export interface DiscordChannel {
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

interface DiscordMember {
  id: string;
  username: string;
  avatar?: string;
  avatar_decoration?: string;
  discriminator: string;
  public_flags: number;
  bot?: boolean;
  flags: number;
  join_timestamp: Date;
  user_id: string;
  muted: boolean;
  mute_config?: any;
}

export interface DiscordGuildMember {
  user?: DiscordMember;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
  is_pending?: boolean;
  communication_disabled_until?: string;
  flags?: number;
}

interface DiscordFirstMessage {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  author: DiscordAuthor;
  attachments: any[];
  embeds: any[];
  mentions: any[];
  mention_roles: any[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: Date;
  edited_timestamp?: any;
  flags: number;
  components: any[];
  position: number;
}

export interface DiscordArchivedPublicThreads {
  threads: DiscordThread[];
  members: DiscordMember[];
  has_more: boolean;
  first_messages: DiscordFirstMessage[];
}

export interface DiscordActiveThreads {
  threads: DiscordThread[];
  members: DiscordMember[];
}
