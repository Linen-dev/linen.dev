export interface DiscordMessage {
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
  message_reference?: MessageReference | null;
  referenced_message?: ReferencedMessage | null;
}
export interface Author {
  id: string;
  username: string;
  avatar?: string | null;
  avatar_decoration?: null;
  discriminator: string;
  public_flags: number;
  bot?: boolean;
}
export interface MessageReference {
  channel_id: string;
  guild_id: string;
  message_id: string;
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
  create_timestamp: string;
}
