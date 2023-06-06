import type { SerializedAccount } from '@linen/types';
import type { DI } from '@/di/types';

const Web: DI = {
  openExternal: async (url: string) => {
    window.location.href = url;
  },
  listenDeepLink: async (callback: (...args: any) => any) => {},

  buildExternalOrigin: (path: string) => `${window.location.origin}/${path}`,

  callbackUrl: () => window.location.href,

  getHomeUrl: (community: SerializedAccount) =>
    `/s/${community.slackDomain || community.discordDomain}`,

  setTitleBarListeners() {},

  requestNotificationPermission: async () => {
    // TODO
  },

  sendNotification: async (body: string, callback: string) => {
    // TODO
  },

  buildInternalUrl: (path: string) => {
    return `/${path}`;
  },
  checkForUpdate: async () => {},

  isDarwin: async () => {
    return false;
  },
};

export default Web;
