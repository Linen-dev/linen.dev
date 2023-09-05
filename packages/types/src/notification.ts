import { makeEnum } from './utils/makeEnum';
import { users } from './users';
import { mentions } from './mentions';

export const notificationType = makeEnum({
  MENTION: 'MENTION',
  THREAD: 'THREAD',
  CHANNEL: 'CHANNEL',
});
export type notificationType =
  typeof notificationType[keyof typeof notificationType];

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
