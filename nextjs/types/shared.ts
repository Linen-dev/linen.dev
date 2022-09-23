export interface SerializedReaction {
  type: string;
  count: number;
}

export interface SerializedAttachment {
  url: string;
  name: string;
}

export interface Permissions {
  access: boolean;
  feed: boolean;
  chat: boolean;
  channel_create: boolean;
}
