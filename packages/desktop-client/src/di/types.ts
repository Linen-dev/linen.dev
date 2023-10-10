import { SerializedAccount } from '@linen/types';

export type DI = {
  openExternal: (url: string) => void;
  listenDeepLink: (callback: (...args: any) => any) => Promise<void>;
  callbackUrl: () => string;
  getHomeUrl: (community: SerializedAccount) => string;
  requestNotificationPermission: () => void;
  sendNotification: (body: string, callback: string) => Promise<void>;
  buildExternalOrigin: (path: string) => string;
  buildInternalUrl: (path: string) => string;
  checkForUpdate: () => Promise<void>;
  isDarwin: () => Promise<boolean>;
};
