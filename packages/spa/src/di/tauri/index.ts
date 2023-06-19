import { open } from '@tauri-apps/api/shell';
import { TauriEvent, emit, listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/api/notification';
import type { SerializedAccount } from '@linen/types';
import { playNotificationSound } from '@/utils/playNotificationSound';
import type { DI } from '@/di/types';
import { type } from '@tauri-apps/api/os';

const Tauri: DI = {
  openExternal: async (url: string) => {
    await open(url);
  },

  listenDeepLink: async (callback: (...args: any) => any) => {
    await listen('scheme-request-received', callback);
  },

  setTitleBarListeners() {
    document.addEventListener('click', (event) => {
      console.log(event);
      const node = event?.target as HTMLElement;
      const id = node?.id;
      if (id === 'titlebar-minimize' || id === 'titlebar-minimize-img') {
        appWindow.minimize();
      } else if (id === 'titlebar-maximize' || id === 'titlebar-maximize-img') {
        appWindow.toggleMaximize();
      } else if (id === 'titlebar-close' || id === 'titlebar-close-img') {
        appWindow.close();
      }
    });
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

  sendNotification: async (body: string, callback: string) => {
    let permissionGranted = await isPermissionGranted();
    if (permissionGranted) {
      sendNotification({ title: 'Linen', body });
      playNotificationSound(0.2);
    }
  },

  buildInternalUrl: (path: string) => {
    return `/${path}`;
  },

  checkForUpdate: async () => {
    await emit(TauriEvent.CHECK_UPDATE);
  },

  isDarwin: async () => {
    const osType = await type();
    return osType === 'Darwin';
  },
};

export default Tauri;
