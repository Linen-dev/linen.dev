import type { mentions, users } from '@linen/database';

type notificationType = 'MENTION' | 'THREAD' | 'CHANNEL';

export type emailNotificationPayloadType = {
  authId: string;
  notificationType: notificationType;
};

export type notificationListenerType = {
  channelId: any;
  messageId: any;
  threadId: any;
  communityId: string;
  isThread: boolean;
  isReply: boolean;
  mentions: (mentions & { users: users | null })[];
  imitationId?: string; // unused here
  thread?: string;
  message?: string;
};
