import { open } from '@tauri-apps/api/shell';
import { listen } from '@tauri-apps/api/event';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification';
import type { SerializedAccount } from '@linen/types';
import { playNotificationSound } from '@/utils/playNotificationSound';
import type { DI } from '@/di/types';

const Tauri: DI = {
  openExternal: async (url: string) => {
    await open(url);
  },

  listenDeepLink: async (callback: (...args: any) => any) => {
    await listen('scheme-request-received', callback);
  },

  buildExternalOrigin: (path: string) => 'linenapp://' + path,

  callbackUrl: () => 'linenapp://signin',

  getHomeUrl: (community: SerializedAccount) =>
    `/s/${community.slackDomain || community.discordDomain}`,

  requestNotificationPermission: async () => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
      localStorage.setItem(
        'linen.tauri.permissionRequested',
        String(permissionGranted)
      );
    }
  },

  sendNotification: async (body: string, title: string = 'Linen.dev') => {
    let permissionGranted = await isPermissionGranted();
    if (permissionGranted) {
      sendNotification({ title, body });
      playNotificationSound(0.2);
    }
  },

  buildInternalUrl: (path: string) => {
    return `/${path}`;
  },
};

export default Tauri;
